import {PUBLISHED_AT} from "..";
import {String} from "../../_dependencies/source/0x1/string/structs";
import {obj, pure} from "../../_framework/util";
import {Transaction, TransactionArgument, TransactionObjectInput} from "@mysten/sui/transactions";

export function createChat( tx: Transaction, invitee: string | TransactionArgument ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::create_chat`, arguments: [ pure(tx, invitee, `address`) ], }) }

export function destroyChat( tx: Transaction, self: TransactionObjectInput ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::destroy_chat`, arguments: [ obj(tx, self) ], }) }

export function destroyChatLink( tx: Transaction, self: TransactionObjectInput ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::destroy_chat_link`, arguments: [ obj(tx, self) ], }) }

export function init( tx: Transaction, ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::init`, arguments: [ ], }) }

export interface RegisterMessageArgs { chat: TransactionObjectInput; msg: string | TransactionArgument }

export function registerMessage( tx: Transaction, args: RegisterMessageArgs ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::register_message`, arguments: [ obj(tx, args.chat), pure(tx, args.msg, `address`) ], }) }

export interface SetPubkeyArgs { chat: TransactionObjectInput; pubkey: string | TransactionArgument }

export function setPubkey( tx: Transaction, args: SetPubkeyArgs ) { return tx.moveCall({ target: `${PUBLISHED_AT}::cable::set_pubkey`, arguments: [ obj(tx, args.chat), pure(tx, args.pubkey, `${String.$typeName}`) ], }) }
