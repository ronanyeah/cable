import "./index.css";

const { Elm } = require("./Main.elm");

import { ec } from "elliptic";
import { faker } from "@faker-js/faker/locale/en";
import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiAddress } from "@mysten/sui/utils";

import { Chat } from "./codegen/cable/cable/structs";
import { registerMessage, setPubkey } from "./codegen/cable/cable/functions";

import { performDiffieHellman, deriveKeyPair } from "./encryption";
import * as walletSelect from "./walletSelect";
import { ElmApp, Chat as ElmChat } from "./ports";
import * as lib from "./lib";

const ecCurve = new ec("secp256k1");

const walletHooks: walletSelect.WalletHooks = {
  signMsg: null,
  setModalOpen: null,
  disconnectWallet: null,
  signTx: null,
};

interface ChatWatch {
  decryptKey: CryptoKey;
  chatId: string;
  lastMessage: string;
  isCreator: boolean;
}

let chatWatch: ChatWatch | null = null;

(async () => {
  const app: ElmApp = Elm.Main.init({
    node: document.getElementById("app"),
    flags: {},
  });

  (async () => {
    while (true) {
      if (chatWatch) {
        (async () => {
          const savedChat = chatWatch as ChatWatch;
          const chat = await Chat.fetch(lib.testnet, savedChat.chatId);
          if (chat.lastMessage !== savedChat.lastMessage) {
            savedChat.lastMessage = chat.lastMessage;
            const blobId = await lib.getBlobFromObject(chat.lastMessage);
            const msgs = await lib.decryptMessages(
              blobId,
              savedChat.decryptKey,
              savedChat.isCreator
            );
            app.ports.msgsCb.send(msgs.toReversed());
          }
        })().catch(console.error);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  })();

  app.ports.share.subscribe((url) =>
    window.navigator.share({
      title: "Cable",
      url,
    })
  );

  app.ports.writeMessage.subscribe(
    ({ myPriv, otherPub, wallet, chatId, message }) =>
      (async () => {
        if (!walletHooks.signTx) {
          return;
        }

        const kp = ecCurve.keyFromPrivate(myPriv);

        const sharedKey = await performDiffieHellman(kp, otherPub);

        const chat = await Chat.fetch(lib.testnet, chatId);
        app.ports.statusCb.send("Writing to Walrus");
        const isCreator = chat.creator === wallet;
        const blob = await lib.writeMsg(
          chat.lastMessage === lib.ZERO_ADDR
            ? null
            : await lib.getBlobFromObject(chat.lastMessage),
          message,
          isCreator,
          sharedKey
        );

        app.ports.statusCb.send("Signing transaction");
        const blobObj = blob.newlyCreated.blobObject.id;
        const blobId = blob.newlyCreated.blobObject.blobId;

        const txb = new Transaction();
        txb.setSender(wallet);
        registerMessage(txb, { chat: chatId, msg: blobObj });

        const signed = await walletHooks.signTx({
          transaction: txb,
          chain: lib.SUI_TESTNET_CHAIN,
        });
        app.ports.statusCb.send("Submitting transaction");
        await lib.submitAndConfirmTx(signed);

        app.ports.statusCb.send("Retrieving content");
        const msgs = await lib.decryptMessages(blobId, sharedKey, isCreator);
        app.ports.msgsCb.send(msgs.toReversed());
      })().catch((e) => {
        console.error(e);
        app.ports.statusCb.send(null);
      })
  );

  app.ports.exitChat.subscribe(() => {
    chatWatch = null;
  });

  app.ports.createMyPub.subscribe(({ wallet, chatId }) =>
    (async () => {
      if (!walletHooks.signTx) {
        return;
      }
      const sig = await seedFromChatId(chatId);
      const sharedKey = await deriveKeyPair(sig);
      const txb = new Transaction();
      txb.setSender(wallet);
      setPubkey(txb, { chat: chatId, pubkey: sharedKey.publicKeyHex });
      const signed = await walletHooks.signTx({
        transaction: txb,
        chain: lib.SUI_TESTNET_CHAIN,
      });
      await lib.submitAndConfirmTx(signed);

      const args = await fetchElmChat(chatId, wallet);

      if (args) {
        args.myPriv = sharedKey.keyPair.getPrivate("hex");
        app.ports.chatCb.send(args);
      }
    })().catch(console.error)
  );

  app.ports.selectChat.subscribe(({ wallet, chatId, myPriv }) =>
    (async () => {
      const sharedKey = await (async () => {
        if (myPriv) {
          return ecCurve.keyFromPrivate(myPriv);
        } else {
          const sig = await seedFromChatId(chatId);
          const sharedKey = await deriveKeyPair(sig);
          return sharedKey.keyPair;
        }
      })();

      app.ports.unlockCb.send({ chatId, myPriv: sharedKey.getPrivate("hex") });

      const chat = await Chat.fetch(lib.testnet, chatId);
      const isCreator = chat.creator === wallet;
      const otherPub = isCreator ? chat.inviteePubkey : chat.creatorPubkey;

      if (!otherPub) {
        throw Error("missing partner pub");
      }

      const sharedBytes = await performDiffieHellman(sharedKey, otherPub);

      chatWatch = {
        chatId: chatId,
        lastMessage: chat.lastMessage,
        isCreator,
        decryptKey: sharedBytes,
      };

      if (chat.lastMessage === lib.ZERO_ADDR) {
        app.ports.msgsCb.send([]);
      } else {
        const blobId = await lib.getBlobFromObject(chat.lastMessage);
        const msgs = await lib.decryptMessages(blobId, sharedBytes, isCreator);
        app.ports.msgsCb.send(msgs.toReversed());
      }
    })().catch(console.error)
  );

  app.ports.rejectChat.subscribe(({ wallet, chatId }) =>
    (async () => {
      if (!walletHooks.signTx) {
        return;
      }
      const chats = await lib.fetchChats(wallet);
      const chatLink = chats.find((pair) => pair.chat === chatId);
      if (!chatLink) {
        return;
      }

      const txb = lib.rejectChat(wallet, chatId, chatLink.link);
      const signed = await walletHooks.signTx({
        transaction: txb,
        chain: lib.SUI_TESTNET_CHAIN,
      });
      await lib.submitAndConfirmTx(signed);
      app.ports.deleteChatCb.send(chatId);
    })().catch(console.error)
  );

  app.ports.refreshChats.subscribe(({ wallet }) =>
    (async () => {
      const chats = await lib.fetchChats(wallet);
      await Promise.all(
        chats.map(async (pair) => {
          const args = await fetchElmChat(pair.chat, wallet);
          if (args) {
            app.ports.chatCb.send(args);
          }
        })
      );
    })().catch(console.error)
  );

  app.ports.createChat.subscribe(({ wallet, counterparty }) =>
    (async () => {
      const res = await (async () => {
        if (!walletHooks.signTx || !counterparty) {
          return null;
        }
        if (!isValidSuiAddress(counterparty)) {
          alert("Invalid address!");
          return null;
        }
        if (wallet == counterparty) {
          alert("Choose a different wallet.");
          return null;
        }
        const createTxb = lib.createConvo(wallet, counterparty);
        const signed = await walletHooks.signTx({
          transaction: createTxb,
          chain: lib.SUI_TESTNET_CHAIN,
        });
        const res = await lib.submitAndConfirmTx(signed);

        const newObj = res.effects!.created!.find(
          (obj: any) => obj.owner.Shared
        )!.reference.objectId;

        return {
          otherWallet: counterparty,
          myPub: null,
          myPriv: null,
          otherPub: null,
          isCreator: true,
          id: newObj,
          name: labelObjectId(newObj),
          messages: 0,
        };
      })();

      app.ports.chatCreateCb.send(res);
    })().catch((e) => {
      console.error(e);
      app.ports.chatCreateCb.send(null);
    })
  );

  app.ports.connect.subscribe(() =>
    (async () => {
      if (walletHooks.setModalOpen) {
        walletHooks.setModalOpen(true);
      }
    })().catch(console.error)
  );

  app.ports.copy.subscribe((val) => navigator.clipboard.writeText(val));

  //app.ports.log.subscribe(console.log);

  // PORT SETUP COMPLETE

  walletSelect.init(app, walletHooks);
})().catch(console.error);

function capitalize(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function getSingleWord() {
  while (true) {
    const word = faker.word.noun();
    if (/^[a-zA-Z]+$/.test(word)) {
      return word;
    }
  }
}

function labelObjectId(hexId: string) {
  const seed = hashToInt(hexId);
  faker.seed(seed);
  return (
    capitalize(getSingleWord()) +
    capitalize(getSingleWord()) +
    capitalize(getSingleWord())
  );
}

function hashToInt(hex: string) {
  return lib
    .fromHexString(hex)
    .reduce((hash, num) => (hash << 5) + hash + num, 5381);
}

async function fetchElmChat(
  chatId: string,
  wallet: string
): Promise<ElmChat | null> {
  const obj = await lib.testnet.getObject({
    id: chatId,
    options: { showBcs: true },
  });
  if (!obj.data) {
    return null;
  }
  const chat = Chat.fromSuiObjectData(obj.data);
  const isCreator = chat.creator === wallet;
  const myPub = isCreator ? chat.creatorPubkey : chat.inviteePubkey;
  const otherPub = isCreator ? chat.inviteePubkey : chat.creatorPubkey;
  const args = {
    otherWallet: isCreator ? chat.invitee : chat.creator,
    myPub,
    myPriv: null,
    otherPub,
    isCreator,
    id: chatId,
    name: labelObjectId(chatId),
    messages: chat.messages,
  };
  return args;
}

async function seedFromChatId(chatId: string): Promise<Uint8Array> {
  if (!walletHooks.signMsg) {
    throw Error("signMsg missing");
  }
  const bytes = lib.fromHexString(chatId);
  const res = await walletHooks.signMsg(bytes);
  const sig = Uint8Array.from(atob(res.signature), (c) => c.charCodeAt(0));
  return sig;
}
