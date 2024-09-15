import {Option} from "../../_dependencies/source/0x1/option/structs";
import {String} from "../../_dependencies/source/0x1/string/structs";
import {ID, UID} from "../../_dependencies/source/0x2/object/structs";
import {PhantomReified, Reified, StructClass, ToField, ToTypeStr, decodeFromFields, decodeFromFieldsWithTypes, decodeFromJSONField, fieldToJSON, phantom} from "../../_framework/reified";
import {FieldsWithTypes, composeSuiType, compressSuiType} from "../../_framework/util";
import {PKG_V1} from "../index";
import {bcs} from "@mysten/sui/bcs";
import {SuiClient, SuiObjectData, SuiParsedData} from "@mysten/sui/client";
import {fromB64, fromHEX, toHEX} from "@mysten/sui/utils";

/* ============================== Chat =============================== */

export function isChat(type: string): boolean { type = compressSuiType(type); return type === `${PKG_V1}::cable::Chat`; }

export interface ChatFields { id: ToField<UID>; creator: ToField<"address">; creatorPubkey: ToField<Option<String>>; invitee: ToField<"address">; inviteePubkey: ToField<Option<String>>; lastMessage: ToField<"address">; messages: ToField<"u16"> }

export type ChatReified = Reified< Chat, ChatFields >;

export class Chat implements StructClass { __StructClass = true as const;

 static readonly $typeName = `${PKG_V1}::cable::Chat`; static readonly $numTypeParams = 0; static readonly $isPhantom = [] as const;

 readonly $typeName = Chat.$typeName; readonly $fullTypeName: `${typeof PKG_V1}::cable::Chat`; readonly $typeArgs: []; readonly $isPhantom = Chat.$isPhantom;

 readonly id: ToField<UID>; readonly creator: ToField<"address">; readonly creatorPubkey: ToField<Option<String>>; readonly invitee: ToField<"address">; readonly inviteePubkey: ToField<Option<String>>; readonly lastMessage: ToField<"address">; readonly messages: ToField<"u16">

 private constructor(typeArgs: [], fields: ChatFields, ) { this.$fullTypeName = composeSuiType( Chat.$typeName, ...typeArgs ) as `${typeof PKG_V1}::cable::Chat`; this.$typeArgs = typeArgs;

 this.id = fields.id;; this.creator = fields.creator;; this.creatorPubkey = fields.creatorPubkey;; this.invitee = fields.invitee;; this.inviteePubkey = fields.inviteePubkey;; this.lastMessage = fields.lastMessage;; this.messages = fields.messages; }

 static reified( ): ChatReified { return { typeName: Chat.$typeName, fullTypeName: composeSuiType( Chat.$typeName, ...[] ) as `${typeof PKG_V1}::cable::Chat`, typeArgs: [ ] as [], isPhantom: Chat.$isPhantom, reifiedTypeArgs: [], fromFields: (fields: Record<string, any>) => Chat.fromFields( fields, ), fromFieldsWithTypes: (item: FieldsWithTypes) => Chat.fromFieldsWithTypes( item, ), fromBcs: (data: Uint8Array) => Chat.fromBcs( data, ), bcs: Chat.bcs, fromJSONField: (field: any) => Chat.fromJSONField( field, ), fromJSON: (json: Record<string, any>) => Chat.fromJSON( json, ), fromSuiParsedData: (content: SuiParsedData) => Chat.fromSuiParsedData( content, ), fromSuiObjectData: (content: SuiObjectData) => Chat.fromSuiObjectData( content, ), fetch: async (client: SuiClient, id: string) => Chat.fetch( client, id, ), new: ( fields: ChatFields, ) => { return new Chat( [], fields ) }, kind: "StructClassReified", } }

 static get r() { return Chat.reified() }

 static phantom( ): PhantomReified<ToTypeStr<Chat>> { return phantom(Chat.reified( )); } static get p() { return Chat.phantom() }

 static get bcs() { return bcs.struct("Chat", {

 id: UID.bcs, creator: bcs.bytes(32).transform({ input: (val: string) => fromHEX(val), output: (val: Uint8Array) => toHEX(val), }), creator_pubkey: Option.bcs(String.bcs), invitee: bcs.bytes(32).transform({ input: (val: string) => fromHEX(val), output: (val: Uint8Array) => toHEX(val), }), invitee_pubkey: Option.bcs(String.bcs), last_message: bcs.bytes(32).transform({ input: (val: string) => fromHEX(val), output: (val: Uint8Array) => toHEX(val), }), messages: bcs.u16()

}) };

 static fromFields( fields: Record<string, any> ): Chat { return Chat.reified( ).new( { id: decodeFromFields(UID.reified(), fields.id), creator: decodeFromFields("address", fields.creator), creatorPubkey: decodeFromFields(Option.reified(String.reified()), fields.creator_pubkey), invitee: decodeFromFields("address", fields.invitee), inviteePubkey: decodeFromFields(Option.reified(String.reified()), fields.invitee_pubkey), lastMessage: decodeFromFields("address", fields.last_message), messages: decodeFromFields("u16", fields.messages) } ) }

 static fromFieldsWithTypes( item: FieldsWithTypes ): Chat { if (!isChat(item.type)) { throw new Error("not a Chat type");

 }

 return Chat.reified( ).new( { id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id), creator: decodeFromFieldsWithTypes("address", item.fields.creator), creatorPubkey: decodeFromFieldsWithTypes(Option.reified(String.reified()), item.fields.creator_pubkey), invitee: decodeFromFieldsWithTypes("address", item.fields.invitee), inviteePubkey: decodeFromFieldsWithTypes(Option.reified(String.reified()), item.fields.invitee_pubkey), lastMessage: decodeFromFieldsWithTypes("address", item.fields.last_message), messages: decodeFromFieldsWithTypes("u16", item.fields.messages) } ) }

 static fromBcs( data: Uint8Array ): Chat { return Chat.fromFields( Chat.bcs.parse(data) ) }

 toJSONField() { return {

 id: this.id,creator: this.creator,creatorPubkey: fieldToJSON<Option<String>>(`${Option.$typeName}<${String.$typeName}>`, this.creatorPubkey),invitee: this.invitee,inviteePubkey: fieldToJSON<Option<String>>(`${Option.$typeName}<${String.$typeName}>`, this.inviteePubkey),lastMessage: this.lastMessage,messages: this.messages,

} }

 toJSON() { return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() } }

 static fromJSONField( field: any ): Chat { return Chat.reified( ).new( { id: decodeFromJSONField(UID.reified(), field.id), creator: decodeFromJSONField("address", field.creator), creatorPubkey: decodeFromJSONField(Option.reified(String.reified()), field.creatorPubkey), invitee: decodeFromJSONField("address", field.invitee), inviteePubkey: decodeFromJSONField(Option.reified(String.reified()), field.inviteePubkey), lastMessage: decodeFromJSONField("address", field.lastMessage), messages: decodeFromJSONField("u16", field.messages) } ) }

 static fromJSON( json: Record<string, any> ): Chat { if (json.$typeName !== Chat.$typeName) { throw new Error("not a WithTwoGenerics json object") };

 return Chat.fromJSONField( json, ) }

 static fromSuiParsedData( content: SuiParsedData ): Chat { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isChat(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a Chat object`); } return Chat.fromFieldsWithTypes( content ); }

 static fromSuiObjectData( data: SuiObjectData ): Chat { if (data.bcs) { if (data.bcs.dataType !== "moveObject" || !isChat(data.bcs.type)) { throw new Error(`object at is not a Chat object`); }

 return Chat.fromBcs( fromB64(data.bcs.bcsBytes) ); } if (data.content) { return Chat.fromSuiParsedData( data.content ) } throw new Error( "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request." ); }

 static async fetch( client: SuiClient, id: string ): Promise<Chat> { const res = await client.getObject({ id, options: { showBcs: true, }, }); if (res.error) { throw new Error(`error fetching Chat object at id ${id}: ${res.error.code}`); } if (res.data?.bcs?.dataType !== "moveObject" || !isChat(res.data.bcs.type)) { throw new Error(`object at id ${id} is not a Chat object`); }

 return Chat.fromSuiObjectData( res.data ); }

 }

/* ============================== ChatLink =============================== */

export function isChatLink(type: string): boolean { type = compressSuiType(type); return type === `${PKG_V1}::cable::ChatLink`; }

export interface ChatLinkFields { id: ToField<UID>; chat: ToField<ID> }

export type ChatLinkReified = Reified< ChatLink, ChatLinkFields >;

export class ChatLink implements StructClass { __StructClass = true as const;

 static readonly $typeName = `${PKG_V1}::cable::ChatLink`; static readonly $numTypeParams = 0; static readonly $isPhantom = [] as const;

 readonly $typeName = ChatLink.$typeName; readonly $fullTypeName: `${typeof PKG_V1}::cable::ChatLink`; readonly $typeArgs: []; readonly $isPhantom = ChatLink.$isPhantom;

 readonly id: ToField<UID>; readonly chat: ToField<ID>

 private constructor(typeArgs: [], fields: ChatLinkFields, ) { this.$fullTypeName = composeSuiType( ChatLink.$typeName, ...typeArgs ) as `${typeof PKG_V1}::cable::ChatLink`; this.$typeArgs = typeArgs;

 this.id = fields.id;; this.chat = fields.chat; }

 static reified( ): ChatLinkReified { return { typeName: ChatLink.$typeName, fullTypeName: composeSuiType( ChatLink.$typeName, ...[] ) as `${typeof PKG_V1}::cable::ChatLink`, typeArgs: [ ] as [], isPhantom: ChatLink.$isPhantom, reifiedTypeArgs: [], fromFields: (fields: Record<string, any>) => ChatLink.fromFields( fields, ), fromFieldsWithTypes: (item: FieldsWithTypes) => ChatLink.fromFieldsWithTypes( item, ), fromBcs: (data: Uint8Array) => ChatLink.fromBcs( data, ), bcs: ChatLink.bcs, fromJSONField: (field: any) => ChatLink.fromJSONField( field, ), fromJSON: (json: Record<string, any>) => ChatLink.fromJSON( json, ), fromSuiParsedData: (content: SuiParsedData) => ChatLink.fromSuiParsedData( content, ), fromSuiObjectData: (content: SuiObjectData) => ChatLink.fromSuiObjectData( content, ), fetch: async (client: SuiClient, id: string) => ChatLink.fetch( client, id, ), new: ( fields: ChatLinkFields, ) => { return new ChatLink( [], fields ) }, kind: "StructClassReified", } }

 static get r() { return ChatLink.reified() }

 static phantom( ): PhantomReified<ToTypeStr<ChatLink>> { return phantom(ChatLink.reified( )); } static get p() { return ChatLink.phantom() }

 static get bcs() { return bcs.struct("ChatLink", {

 id: UID.bcs, chat: ID.bcs

}) };

 static fromFields( fields: Record<string, any> ): ChatLink { return ChatLink.reified( ).new( { id: decodeFromFields(UID.reified(), fields.id), chat: decodeFromFields(ID.reified(), fields.chat) } ) }

 static fromFieldsWithTypes( item: FieldsWithTypes ): ChatLink { if (!isChatLink(item.type)) { throw new Error("not a ChatLink type");

 }

 return ChatLink.reified( ).new( { id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id), chat: decodeFromFieldsWithTypes(ID.reified(), item.fields.chat) } ) }

 static fromBcs( data: Uint8Array ): ChatLink { return ChatLink.fromFields( ChatLink.bcs.parse(data) ) }

 toJSONField() { return {

 id: this.id,chat: this.chat,

} }

 toJSON() { return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() } }

 static fromJSONField( field: any ): ChatLink { return ChatLink.reified( ).new( { id: decodeFromJSONField(UID.reified(), field.id), chat: decodeFromJSONField(ID.reified(), field.chat) } ) }

 static fromJSON( json: Record<string, any> ): ChatLink { if (json.$typeName !== ChatLink.$typeName) { throw new Error("not a WithTwoGenerics json object") };

 return ChatLink.fromJSONField( json, ) }

 static fromSuiParsedData( content: SuiParsedData ): ChatLink { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isChatLink(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a ChatLink object`); } return ChatLink.fromFieldsWithTypes( content ); }

 static fromSuiObjectData( data: SuiObjectData ): ChatLink { if (data.bcs) { if (data.bcs.dataType !== "moveObject" || !isChatLink(data.bcs.type)) { throw new Error(`object at is not a ChatLink object`); }

 return ChatLink.fromBcs( fromB64(data.bcs.bcsBytes) ); } if (data.content) { return ChatLink.fromSuiParsedData( data.content ) } throw new Error( "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request." ); }

 static async fetch( client: SuiClient, id: string ): Promise<ChatLink> { const res = await client.getObject({ id, options: { showBcs: true, }, }); if (res.error) { throw new Error(`error fetching ChatLink object at id ${id}: ${res.error.code}`); } if (res.data?.bcs?.dataType !== "moveObject" || !isChatLink(res.data.bcs.type)) { throw new Error(`object at id ${id} is not a ChatLink object`); }

 return ChatLink.fromSuiObjectData( res.data ); }

 }

/* ============================== NewChat =============================== */

export function isNewChat(type: string): boolean { type = compressSuiType(type); return type === `${PKG_V1}::cable::NewChat`; }

export interface NewChatFields { chat: ToField<ID> }

export type NewChatReified = Reified< NewChat, NewChatFields >;

export class NewChat implements StructClass { __StructClass = true as const;

 static readonly $typeName = `${PKG_V1}::cable::NewChat`; static readonly $numTypeParams = 0; static readonly $isPhantom = [] as const;

 readonly $typeName = NewChat.$typeName; readonly $fullTypeName: `${typeof PKG_V1}::cable::NewChat`; readonly $typeArgs: []; readonly $isPhantom = NewChat.$isPhantom;

 readonly chat: ToField<ID>

 private constructor(typeArgs: [], fields: NewChatFields, ) { this.$fullTypeName = composeSuiType( NewChat.$typeName, ...typeArgs ) as `${typeof PKG_V1}::cable::NewChat`; this.$typeArgs = typeArgs;

 this.chat = fields.chat; }

 static reified( ): NewChatReified { return { typeName: NewChat.$typeName, fullTypeName: composeSuiType( NewChat.$typeName, ...[] ) as `${typeof PKG_V1}::cable::NewChat`, typeArgs: [ ] as [], isPhantom: NewChat.$isPhantom, reifiedTypeArgs: [], fromFields: (fields: Record<string, any>) => NewChat.fromFields( fields, ), fromFieldsWithTypes: (item: FieldsWithTypes) => NewChat.fromFieldsWithTypes( item, ), fromBcs: (data: Uint8Array) => NewChat.fromBcs( data, ), bcs: NewChat.bcs, fromJSONField: (field: any) => NewChat.fromJSONField( field, ), fromJSON: (json: Record<string, any>) => NewChat.fromJSON( json, ), fromSuiParsedData: (content: SuiParsedData) => NewChat.fromSuiParsedData( content, ), fromSuiObjectData: (content: SuiObjectData) => NewChat.fromSuiObjectData( content, ), fetch: async (client: SuiClient, id: string) => NewChat.fetch( client, id, ), new: ( fields: NewChatFields, ) => { return new NewChat( [], fields ) }, kind: "StructClassReified", } }

 static get r() { return NewChat.reified() }

 static phantom( ): PhantomReified<ToTypeStr<NewChat>> { return phantom(NewChat.reified( )); } static get p() { return NewChat.phantom() }

 static get bcs() { return bcs.struct("NewChat", {

 chat: ID.bcs

}) };

 static fromFields( fields: Record<string, any> ): NewChat { return NewChat.reified( ).new( { chat: decodeFromFields(ID.reified(), fields.chat) } ) }

 static fromFieldsWithTypes( item: FieldsWithTypes ): NewChat { if (!isNewChat(item.type)) { throw new Error("not a NewChat type");

 }

 return NewChat.reified( ).new( { chat: decodeFromFieldsWithTypes(ID.reified(), item.fields.chat) } ) }

 static fromBcs( data: Uint8Array ): NewChat { return NewChat.fromFields( NewChat.bcs.parse(data) ) }

 toJSONField() { return {

 chat: this.chat,

} }

 toJSON() { return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() } }

 static fromJSONField( field: any ): NewChat { return NewChat.reified( ).new( { chat: decodeFromJSONField(ID.reified(), field.chat) } ) }

 static fromJSON( json: Record<string, any> ): NewChat { if (json.$typeName !== NewChat.$typeName) { throw new Error("not a WithTwoGenerics json object") };

 return NewChat.fromJSONField( json, ) }

 static fromSuiParsedData( content: SuiParsedData ): NewChat { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isNewChat(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a NewChat object`); } return NewChat.fromFieldsWithTypes( content ); }

 static fromSuiObjectData( data: SuiObjectData ): NewChat { if (data.bcs) { if (data.bcs.dataType !== "moveObject" || !isNewChat(data.bcs.type)) { throw new Error(`object at is not a NewChat object`); }

 return NewChat.fromBcs( fromB64(data.bcs.bcsBytes) ); } if (data.content) { return NewChat.fromSuiParsedData( data.content ) } throw new Error( "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request." ); }

 static async fetch( client: SuiClient, id: string ): Promise<NewChat> { const res = await client.getObject({ id, options: { showBcs: true, }, }); if (res.error) { throw new Error(`error fetching NewChat object at id ${id}: ${res.error.code}`); } if (res.data?.bcs?.dataType !== "moveObject" || !isNewChat(res.data.bcs.type)) { throw new Error(`object at id ${id} is not a NewChat object`); }

 return NewChat.fromSuiObjectData( res.data ); }

 }

/* ============================== NewMsg =============================== */

export function isNewMsg(type: string): boolean { type = compressSuiType(type); return type === `${PKG_V1}::cable::NewMsg`; }

export interface NewMsgFields { chat: ToField<ID>; msg: ToField<"address"> }

export type NewMsgReified = Reified< NewMsg, NewMsgFields >;

export class NewMsg implements StructClass { __StructClass = true as const;

 static readonly $typeName = `${PKG_V1}::cable::NewMsg`; static readonly $numTypeParams = 0; static readonly $isPhantom = [] as const;

 readonly $typeName = NewMsg.$typeName; readonly $fullTypeName: `${typeof PKG_V1}::cable::NewMsg`; readonly $typeArgs: []; readonly $isPhantom = NewMsg.$isPhantom;

 readonly chat: ToField<ID>; readonly msg: ToField<"address">

 private constructor(typeArgs: [], fields: NewMsgFields, ) { this.$fullTypeName = composeSuiType( NewMsg.$typeName, ...typeArgs ) as `${typeof PKG_V1}::cable::NewMsg`; this.$typeArgs = typeArgs;

 this.chat = fields.chat;; this.msg = fields.msg; }

 static reified( ): NewMsgReified { return { typeName: NewMsg.$typeName, fullTypeName: composeSuiType( NewMsg.$typeName, ...[] ) as `${typeof PKG_V1}::cable::NewMsg`, typeArgs: [ ] as [], isPhantom: NewMsg.$isPhantom, reifiedTypeArgs: [], fromFields: (fields: Record<string, any>) => NewMsg.fromFields( fields, ), fromFieldsWithTypes: (item: FieldsWithTypes) => NewMsg.fromFieldsWithTypes( item, ), fromBcs: (data: Uint8Array) => NewMsg.fromBcs( data, ), bcs: NewMsg.bcs, fromJSONField: (field: any) => NewMsg.fromJSONField( field, ), fromJSON: (json: Record<string, any>) => NewMsg.fromJSON( json, ), fromSuiParsedData: (content: SuiParsedData) => NewMsg.fromSuiParsedData( content, ), fromSuiObjectData: (content: SuiObjectData) => NewMsg.fromSuiObjectData( content, ), fetch: async (client: SuiClient, id: string) => NewMsg.fetch( client, id, ), new: ( fields: NewMsgFields, ) => { return new NewMsg( [], fields ) }, kind: "StructClassReified", } }

 static get r() { return NewMsg.reified() }

 static phantom( ): PhantomReified<ToTypeStr<NewMsg>> { return phantom(NewMsg.reified( )); } static get p() { return NewMsg.phantom() }

 static get bcs() { return bcs.struct("NewMsg", {

 chat: ID.bcs, msg: bcs.bytes(32).transform({ input: (val: string) => fromHEX(val), output: (val: Uint8Array) => toHEX(val), })

}) };

 static fromFields( fields: Record<string, any> ): NewMsg { return NewMsg.reified( ).new( { chat: decodeFromFields(ID.reified(), fields.chat), msg: decodeFromFields("address", fields.msg) } ) }

 static fromFieldsWithTypes( item: FieldsWithTypes ): NewMsg { if (!isNewMsg(item.type)) { throw new Error("not a NewMsg type");

 }

 return NewMsg.reified( ).new( { chat: decodeFromFieldsWithTypes(ID.reified(), item.fields.chat), msg: decodeFromFieldsWithTypes("address", item.fields.msg) } ) }

 static fromBcs( data: Uint8Array ): NewMsg { return NewMsg.fromFields( NewMsg.bcs.parse(data) ) }

 toJSONField() { return {

 chat: this.chat,msg: this.msg,

} }

 toJSON() { return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() } }

 static fromJSONField( field: any ): NewMsg { return NewMsg.reified( ).new( { chat: decodeFromJSONField(ID.reified(), field.chat), msg: decodeFromJSONField("address", field.msg) } ) }

 static fromJSON( json: Record<string, any> ): NewMsg { if (json.$typeName !== NewMsg.$typeName) { throw new Error("not a WithTwoGenerics json object") };

 return NewMsg.fromJSONField( json, ) }

 static fromSuiParsedData( content: SuiParsedData ): NewMsg { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isNewMsg(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a NewMsg object`); } return NewMsg.fromFieldsWithTypes( content ); }

 static fromSuiObjectData( data: SuiObjectData ): NewMsg { if (data.bcs) { if (data.bcs.dataType !== "moveObject" || !isNewMsg(data.bcs.type)) { throw new Error(`object at is not a NewMsg object`); }

 return NewMsg.fromBcs( fromB64(data.bcs.bcsBytes) ); } if (data.content) { return NewMsg.fromSuiParsedData( data.content ) } throw new Error( "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request." ); }

 static async fetch( client: SuiClient, id: string ): Promise<NewMsg> { const res = await client.getObject({ id, options: { showBcs: true, }, }); if (res.error) { throw new Error(`error fetching NewMsg object at id ${id}: ${res.error.code}`); } if (res.data?.bcs?.dataType !== "moveObject" || !isNewMsg(res.data.bcs.type)) { throw new Error(`object at id ${id} is not a NewMsg object`); }

 return NewMsg.fromSuiObjectData( res.data ); }

 }
