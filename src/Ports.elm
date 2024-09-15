port module Ports exposing (..)


type alias Chat =
    { myPub : Maybe String
    , myPriv : Maybe String
    , name : String
    , otherPub : Maybe String
    , otherWallet : String
    , isCreator : Bool
    , id : String
    , messages : Int
    }


type alias WriteArgs =
    { wallet : String
    , chatId : String
    , otherPub : String
    , myPriv : String
    , message : String
    }



-- OUT


port connect : () -> Cmd msg


port createChat : { wallet : String, counterparty : String } -> Cmd msg


port createMyPub : { wallet : String, chatId : String } -> Cmd msg


port writeMessage : WriteArgs -> Cmd msg


port selectChat : { wallet : String, chatId : String, myPriv : Maybe String } -> Cmd msg


port refreshChats : { wallet : String } -> Cmd msg


port log : String -> Cmd msg


port copy : String -> Cmd msg


port share : String -> Cmd msg


port rejectChat : { chatId : String, wallet : String } -> Cmd msg


port exitChat : () -> Cmd msg



-- IN


port chatCb : (Chat -> msg) -> Sub msg


port walletCb : (Maybe String -> msg) -> Sub msg


port chatCreateCb : (Maybe Chat -> msg) -> Sub msg


port msgsCb : (List { content : String, me : Bool } -> msg) -> Sub msg


port unlockCb : ({ chatId : String, myPriv : String } -> msg) -> Sub msg


port deleteChatCb : (String -> msg) -> Sub msg


port statusCb : (Maybe String -> msg) -> Sub msg
