import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { SignedTransaction } from "@mysten/dapp-kit";

import { decryptBytes, encryptBytes } from "./encryption";
import {
  createChat,
  destroyChat,
  destroyChatLink,
} from "./codegen/cable/cable/functions";
import { ChatLink } from "./codegen/cable/cable/structs";

// @ts-ignore
export const rpcUrl = __RPC_URL;

const Message = bcs.struct("Message", {
  text: bcs.string(),
  c2i: bcs.bool(),
  previousMessage: bcs.option(bcs.string()),
});

export const SUI_TESTNET_CHAIN = "sui:testnet";

const AGG_URL = "https://aggregator-devnet.walrus.space/v1/";

export const ZERO_ADDR =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const testnet = new SuiClient({
  transport: new SuiHTTPTransport({
    url: rpcUrl,
    //websocket: {
    //reconnectTimeout: 1000,
    //url: "wss://sui-testnet.blockvision.org/v1/foo",
    //},
  }),
});

export async function submitAndConfirmTx(signed: SignedTransaction) {
  const res = await testnet.executeTransactionBlock({
    transactionBlock: signed.bytes,
    signature: signed.signature,
    options: { showEffects: true },
  });
  if (res.effects!.status.status === "failure") {
    throw new Error(res.effects!.status.error);
  }
  //while (true) {
  //const r = await testnet
  //.getTransactionBlock({ digest: res.digest })
  //.catch(() => null);
  //if (r) {
  //break;
  //}
  //await new Promise((r) => setTimeout(() => r(true), 1000));
  //}
  return res;
}

export async function getBlobFromObject(addr: string) {
  const obj = await testnet.getObject({
    id: addr,
    options: { showContent: true },
  });
  const data = obj.data?.content as any;
  const id = bcs.U256.serialize(data.fields.blob_id).toBase64();
  return id.replace(/=/g, "").replace(/\//g, "_").replace("+", "-");
}

export async function readMessages(idx: string, sharedKey: CryptoKey) {
  let id = idx;
  const out = [];
  while (true) {
    const response = await fetch(`${AGG_URL}${id}`);
    const val = new Uint8Array(await response.arrayBuffer());
    const decryptedMessage = await decryptBytes(val, sharedKey);
    const message = Message.parse(decryptedMessage);
    out.push(message);
    if (message.previousMessage) {
      id = message.previousMessage;
    } else {
      break;
    }
  }

  return out;
}

export async function decryptMessages(
  idx: string,
  sharedSecretBytes: CryptoKey,
  isCreator: boolean
) {
  const xs = await readMessages(idx, sharedSecretBytes);

  return xs.map((val) => ({
    content: val.text,
    me: (val.c2i && isCreator) || (!val.c2i && !isCreator),
  }));
}

export async function writeMsg(
  previousMessage: string | null,
  content: string,
  c2i: boolean,
  sharedKey: CryptoKey
) {
  const bcsBytes = Message.serialize({
    text: content,
    c2i,
    previousMessage,
  }).toBytes();

  const encryptedMessage = await encryptBytes(bcsBytes, sharedKey);

  const res = await storeBlob(encryptedMessage, 2);
  return res;
}

export async function fetchChats(wallet: string) {
  const xs = await testnet.getOwnedObjects({
    owner: wallet,
    filter: { StructType: ChatLink.$typeName },
    options: { showBcs: true },
  });

  const chats = xs.data.map((obj) => ({
    link: obj.data!.objectId,
    chat: ChatLink.fromSuiObjectData(obj.data!).chat,
  }));

  return chats;
}

export function rejectChat(wallet: string, chatId: string, chatLink: string) {
  const txb = new Transaction();
  txb.setSender(wallet);
  txb.setGasBudget(8_000_000);

  destroyChatLink(txb, chatLink);
  destroyChat(txb, chatId);

  return txb;
}

export function createConvo(wallet: string, invitee: string) {
  const txb = new Transaction();
  txb.setSender(wallet);
  txb.setGasBudget(8_000_000);

  createChat(txb, invitee);

  return txb;
}

async function storeBlob(inputFile: Uint8Array, numEpochs: number) {
  const basePublisherUrl = "https://publisher-devnet.walrus.space";

  const response = await fetch(
    `${basePublisherUrl}/v1/store?epochs=${numEpochs}`,
    {
      method: "PUT",
      body: inputFile,
    }
  );
  if (response.status === 200) {
    return response.json();
  } else {
    throw new Error(response.statusText);
  }
}

export function toHexString(bytes: Uint8Array) {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}

export function fromHexString(hexString: string) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}
