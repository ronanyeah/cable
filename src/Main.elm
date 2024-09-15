module Main exposing (main)

import Browser
import Dict
import Ports
import Time
import Types exposing (..)
import Update exposing (update)
import View exposing (view)


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Ports.chatCreateCb ChatCreateCb
        , Ports.msgsCb MsgsCb
        , Ports.walletCb WalletCb
        , Ports.chatCb ChatCb
        , Ports.unlockCb UnlockCb
        , Ports.statusCb StatusCb
        , Ports.deleteChatCb DeleteCb
        ]



-- INIT


init : Flags -> ( Model, Cmd Msg )
init _ =
    ( { activeChat = Nothing
      , statusMsg = Nothing
      , wallet = Nothing
      , time = Time.millisToPosix 0
      , partnerInput = ""
      , arrow = False
      , scroll = Static
      , loadedChats = Dict.empty
      , chatView = LiveChat
      , createInProgress = False
      , myPublicKey =
            { alg = ""
            , e = ""
            , ext = True
            , key_ops = []
            , kty = ""
            , n = ""
            }
      }
    , Cmd.none
    )
