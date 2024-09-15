import "@mysten/dapp-kit/dist/index.css";

import { rpcUrl } from "./lib";
import { ElmApp } from "./ports";
import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import {
  UseMutateAsyncFunction,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  SuiClientProvider,
  createNetworkConfig,
  WalletProvider,
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSignTransaction,
  useSignPersonalMessage,
  SignedPersonalMessage,
  SignedTransaction,
} from "@mysten/dapp-kit";

export interface WalletHooks {
  signMsg: ((bts: Uint8Array) => Promise<SignedPersonalMessage>) | null;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
  disconnectWallet: (() => void) | null;
  // TODO add types
  signTx: UseMutateAsyncFunction<SignedTransaction, any, any> | null;
}

const reactRoot = document.createElement("div");
document.body.appendChild(reactRoot);
const root = createRoot(reactRoot);

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: {
    url: rpcUrl,
  },
});

export function init(app: ElmApp, walletHooks: WalletHooks) {
  root.render(React.createElement(App));

  function App() {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(SuiClientProvider, {
        networks: networkConfig,
        defaultNetwork: "testnet",
        children: React.createElement(WalletProvider, {
          children: React.createElement(WalletComponent),
        }),
      })
    );
  }

  function WalletComponent() {
    const currentAccount = useCurrentAccount();
    const [open, setOpen] = useState(false);
    const { mutate: disconnect } = useDisconnectWallet();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    walletHooks.signMsg = (bts: Uint8Array) =>
      new Promise((res, rej) =>
        signPersonalMessage(
          {
            message: bts,
          },
          {
            onSuccess: (result) => res(result),
            onError: (e) => rej(e),
          }
        )
      );
    walletHooks.setModalOpen = setOpen;
    walletHooks.disconnectWallet = disconnect;
    walletHooks.signTx = signTransaction;

    useEffect(() => {
      if (currentAccount) {
        app.ports.walletCb.send(currentAccount.address);
      } else {
        app.ports.walletCb.send(null);
      }
    }, [currentAccount]);

    return React.createElement(ConnectModal, {
      trigger: React.createElement("div"),
      open: open,
      onOpenChange: setOpen,
    });
  }
}
