/* This file was generated by github.com/ronanyeah/elm-port-gen */

interface ElmApp {
  ports: Ports;
}

interface Ports {
  connect: PortOut<null>;
  disconnect: PortOut<null>;
  createChat: PortOut<{
    wallet: string;
    counterparty: string;
  }>;
  createMyPub: PortOut<{
    wallet: string;
    chatId: string;
  }>;
  writeMessage: PortOut<WriteArgs>;
  selectChat: PortOut<{
    wallet: string;
    chatId: string;
    myPriv: string | null;
  }>;
  refreshChats: PortOut<{
    wallet: string;
  }>;
  log: PortOut<string>;
  copy: PortOut<string>;
  share: PortOut<string>;
  rejectChat: PortOut<{
    chatId: string;
    wallet: string;
  }>;
  exitChat: PortOut<null>;
  chatCb: PortIn<Chat>;
  walletCb: PortIn<string | null>;
  chatCreateCb: PortIn<Chat | null>;
  msgsCb: PortIn<{
    content: string;
    me: boolean;
  }[]>;
  unlockCb: PortIn<{
    chatId: string;
    myPriv: string;
  }>;
  deleteChatCb: PortIn<string>;
  statusCb: PortIn<string | null>;
}

interface PortOut<T> {
  subscribe: (_: (_: T) => void) => void;
}

interface PortIn<T> {
  send: (_: T) => void;
}

type PortResult<E, T> =
    | { err: E; data: null }
    | { err: null; data: T };

interface Chat {
  myPub: string | null;
  myPriv: string | null;
  name: string;
  otherPub: string | null;
  otherWallet: string;
  isCreator: boolean;
  id: string;
  messages: number;
}

interface WriteArgs {
  wallet: string;
  chatId: string;
  otherPub: string;
  myPriv: string;
  message: string;
}

function portOk<E, T>(data: T): PortResult<E, T> {
  return { data, err: null };
}

function portErr<E, T>(err: E): PortResult<E, T> {
  return { data: null, err };
}

export { ElmApp, PortResult, portOk, portErr, Chat, WriteArgs };