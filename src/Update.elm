module Update exposing (update)

import Browser.Dom
import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode
import Maybe.Extra exposing (unwrap)
import Ports
import Task
import Time
import Types exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PartnerChange x ->
            ( { model | partnerInput = x }, Cmd.none )

        CbScrollToBottom _ ->
            ( { model | arrow = False }, Cmd.none )

        CreateChat ->
            ( { model | createInProgress = True }
            , model.wallet
                |> unwrap Cmd.none
                    (\wallet ->
                        Ports.createChat
                            { wallet = wallet
                            , counterparty = model.partnerInput
                            }
                    )
            )

        RefreshChats ->
            ( { model | loadedChats = Dict.empty }
            , model.wallet
                |> unwrap Cmd.none
                    (\wallet ->
                        Ports.refreshChats
                            { wallet = wallet
                            }
                    )
            )

        CreateMyPub wallet chat ->
            ( model, Ports.createMyPub { wallet = wallet, chatId = chat } )

        StatusCb args ->
            ( { model | statusMsg = args }
            , Cmd.none
            )

        WriteMessage args ->
            if String.isEmpty args.message then
                ( model
                , Cmd.none
                )

            else
                ( { model | statusMsg = Just "Encrypting message" }
                , Ports.writeMessage args
                )

        Connect ->
            ( model, Ports.connect () )

        Disconnect ->
            ( { model
                | wallet = Nothing
                , loadedChats = Dict.empty
              }
            , Ports.disconnect ()
            )

        SetView w ->
            ( { model | chatView = w }
            , Cmd.none
            )

        WalletCb w ->
            ( { model
                | wallet = w
                , loadedChats = Dict.empty
              }
            , w
                |> unwrap Cmd.none
                    (\wallet ->
                        Ports.refreshChats
                            { wallet = wallet
                            }
                    )
            )

        ChatCb w ->
            ( { model
                | loadedChats =
                    model.loadedChats
                        |> Dict.insert w.id w
              }
            , Cmd.none
            )

        UnlockCb { chatId, myPriv } ->
            ( { model
                | loadedChats =
                    model.loadedChats
                        |> Dict.update chatId
                            (Maybe.map
                                (\chat ->
                                    { chat | myPriv = Just myPriv }
                                )
                            )
                , activeChat =
                    Just
                        { connId = ConnId ""
                        , lastTypedPing = Time.millisToPosix 0
                        , lastSeenTyping = Time.millisToPosix 0
                        , messages = []
                        , isLive = True
                        , input = ""
                        , partnerPublicKey = Json.Encode.null
                        , chat = chatId
                        }
                , statusMsg = Just "Fetching messages"
              }
            , Cmd.none
            )

        RejectChat id ->
            ( model
            , model.wallet
                |> unwrap Cmd.none
                    (\wallet ->
                        Ports.rejectChat
                            { chatId = id
                            , wallet = wallet
                            }
                    )
            )

        Copy txt ->
            ( model, Ports.copy txt )

        MsgsCb xs ->
            case model.activeChat of
                Just args ->
                    ( { model
                        | activeChat =
                            Just
                                { args
                                    | messages =
                                        xs
                                            |> List.map
                                                (\x ->
                                                    if x.me then
                                                        Self x.content

                                                    else
                                                        Them x.content
                                                )
                                    , input = ""
                                }
                        , statusMsg = Nothing
                      }
                    , scrollToBottom
                    )

                Nothing ->
                    ( model, Cmd.none )

        ChatCreateCb res ->
            res
                |> unwrap
                    ( { model | createInProgress = False }
                    , Cmd.none
                    )
                    (\chat ->
                        ( { model
                            | loadedChats =
                                model.loadedChats
                                    |> Dict.insert chat.id chat
                            , partnerInput = ""
                            , createInProgress = False
                          }
                        , Cmd.none
                        )
                    )

        DeleteCb id ->
            ( { model
                | loadedChats =
                    model.loadedChats
                        |> Dict.remove id
              }
            , Cmd.none
            )

        ScrollToBottom ->
            ( model, scrollToBottom )

        SelectChat chatId ->
            ( model
            , model.wallet
                |> unwrap Cmd.none
                    (\wallet ->
                        Ports.selectChat
                            { chatId = chatId
                            , wallet = wallet
                            , myPriv =
                                model.loadedChats
                                    |> Dict.get chatId
                                    |> Maybe.andThen .myPriv
                            }
                    )
            )

        Share url ->
            ( model, Ports.share url )

        ExitChat ->
            ( { model | activeChat = Nothing }, Ports.exitChat () )

        DisplayScrollButton event ->
            case model.scroll of
                Static ->
                    let
                        ( h, arrow ) =
                            isBottom event
                    in
                    ( { model | arrow = not arrow, scroll = Moving model.time h }, Cmd.none )

                Moving pre h ->
                    if (Time.posixToMillis model.time - Time.posixToMillis pre) > 50 then
                        let
                            ( newH, arrow ) =
                                isBottom event

                            scroll =
                                if h == newH then
                                    Static

                                else
                                    Moving model.time newH
                        in
                        ( { model | arrow = not arrow, scroll = scroll }, Cmd.none )

                    else
                        ( model, Cmd.none )

        InputChange str ->
            ( { model
                | activeChat =
                    model.activeChat
                        |> Maybe.map
                            (\args ->
                                { args
                                    | input = str
                                }
                            )
              }
            , Cmd.none
            )


isBottom : Decode.Value -> ( Int, Bool )
isBottom =
    Decode.decodeValue decodeScrollEvent
        >> Result.map
            (\{ scrollHeight, scrollTop, clientHeight } ->
                -- https://gist.github.com/paulirish/5d52fb081b3570c81e3a
                ( scrollTop, (scrollHeight - scrollTop) < (clientHeight + 100) )
            )
        >> Result.withDefault ( 99, False )


scrollToBottom : Cmd Msg
scrollToBottom =
    Browser.Dom.getViewportOf "messages"
        |> Task.andThen
            (\info ->
                Browser.Dom.setViewportOf "messages" 0 info.scene.height
            )
        |> Task.attempt CbScrollToBottom


decodeScrollEvent : Decoder ScrollData
decodeScrollEvent =
    Decode.map3 ScrollData
        (Decode.at [ "target", "scrollHeight" ] Decode.int)
        (Decode.at [ "target", "scrollTop" ] (Decode.map round Decode.float))
        (Decode.at [ "target", "clientHeight" ] Decode.int)
