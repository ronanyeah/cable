module Types exposing (..)

import Browser.Dom
import Dict exposing (Dict)
import Json.Encode exposing (Value)
import Ports
import Time exposing (Posix)


type alias Model =
    { activeChat : Maybe ChatArgs
    , time : Posix
    , arrow : Bool
    , scroll : ScrollStatus
    , wallet : Maybe String
    , partnerInput : String
    , loadedChats : Dict String Ports.Chat
    , chatView : ChatDisc
    , statusMsg : Maybe String
    , createInProgress : Bool
    }


type Msg
    = CreateChat
    | ChatCb Ports.Chat
    | InputChange String
    | PartnerChange String
    | RefreshChats
    | ExitChat
    | CbScrollToBottom (Result Browser.Dom.Error ())
    | DisplayScrollButton Value
    | ScrollToBottom
    | SetView ChatDisc
    | Share String
    | SelectChat String
    | DeleteCb String
    | Copy String
    | MsgsCb (List { content : String, me : Bool })
    | ChatCreateCb (Maybe Ports.Chat)
    | UnlockCb { chatId : String, myPriv : String }
    | WalletCb (Maybe String)
    | Connect
    | CreateMyPub String String
    | WriteMessage Ports.WriteArgs
    | RejectChat String
    | StatusCb (Maybe String)
    | Disconnect


type alias Flags =
    {}


type ChatDisc
    = LiveChat
    | Incoming
    | Outgoing


type alias ScrollData =
    { scrollHeight : Int
    , scrollTop : Int
    , clientHeight : Int
    }


type Message
    = Self String
    | Them String


type ConnId
    = ConnId String


type alias ChatArgs =
    { connId : ConnId
    , lastSeenTyping : Posix
    , messages : List Message
    , lastTypedPing : Posix
    , isLive : Bool
    , input : String
    , partnerPublicKey : Value
    , chat : String
    }


type ScrollStatus
    = Static
    | Moving Posix Int
