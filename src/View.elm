module View exposing (view)

import Dict
import Element exposing (..)
import Element.Background as Bg
import Element.Border as Border
import Element.Events exposing (onClick)
import Element.Font as Font
import Element.Input as Input exposing (button)
import Helpers.View exposing (style, when, whenJust)
import Html exposing (Html)
import Html.Attributes
import Html.Events exposing (on)
import Img
import Json.Decode
import Json.Encode
import Maybe.Extra exposing (isJust, unwrap)
import Ports
import Style exposing (..)
import Time exposing (Posix)
import Types exposing (..)


view : Model -> Html Msg
view model =
    [ [ img "/icon.png" [ width <| px 70 ]
      , text "CABLE"
            |> el [ Font.bold, Font.size 80, titleFont ]
      ]
        |> row [ centerX, spacing 15 ]
    , case model.activeChat of
        Nothing ->
            model.wallet
                |> unwrap
                    (viewHome model)
                    (viewDash model)

        Just chatData ->
            model.loadedChats
                |> Dict.get chatData.chat
                |> whenJust
                    (\chat ->
                        let
                            writeArgs =
                                Maybe.map3
                                    (\wallet myPriv otherPub ->
                                        { chatId = chat.id
                                        , myPriv = myPriv
                                        , otherPub = otherPub
                                        , wallet = wallet
                                        , message = chatData.input
                                        }
                                    )
                                    model.wallet
                                    chat.myPriv
                                    chat.otherPub
                        in
                        [ [ [ [ text "In chat with:"
                              , [ viewWalletAddr chat.otherWallet [ Font.bold ]
                                , img "/copy.png" [ height <| px 20 ]
                                    |> btn (Just <| Copy chat.otherWallet) []
                                ]
                                    |> row [ spacing 10 ]
                              ]
                                |> column [ spacing 10 ]
                            , text "Exit"
                                |> btn (Just ExitChat)
                                    [ Font.underline
                                    , Font.bold
                                    , alignTop
                                    ]
                            ]
                                |> row
                                    [ Font.size 20
                                    , paddingXY 0 5
                                    , width fill
                                    , spaceEvenly
                                    ]
                          ]
                            |> column
                                [ width fill
                                , Bg.color <| rgb255 245 245 245
                                , padding 10
                                , Border.rounded 10
                                ]
                        , [ chatData.messages
                                |> List.map (msgCard chat.otherWallet)
                                |> column
                                    [ spacing 7
                                    , padding 7
                                    , id "messages"
                                    , onScroll DisplayScrollButton
                                    , width fill
                                    , alignBottom
                                    ]
                                |> el
                                    [ height fill
                                    , scrollbarY
                                    , width <| px 500
                                    ]

                          --, viewTyping model.time chatData.lastSeenTyping
                          , el
                                [ onClick ScrollToBottom, alignLeft, alignBottom, moveUp 40 ]
                                none
                                |> when model.arrow
                          , inputBox chatData.input model.statusMsg chatData.isLive writeArgs
                                |> el [ alignBottom, centerX, padding 10, width fill ]
                          ]
                            |> column
                                [ width fill
                                , height fill
                                , Bg.color <| rgb255 245 245 245
                                , padding 10
                                , Border.rounded 10
                                ]
                        ]
                            |> column
                                [ height fill
                                , centerX
                                , spacing 10
                                ]
                    )
    ]
        |> column [ padding 30, width fill, height fill ]
        |> Element.layoutWith
            { options =
                [ Element.focusStyle
                    { borderColor = Nothing
                    , backgroundColor = Nothing
                    , shadow = Nothing
                    }
                ]
            }
            [ height fill
            , width fill
            , mainFont
            ]


viewHome : Model -> Element Msg
viewHome model =
    [ [ text "End-to-end encrypted wallet-to-wallet messaging." ]
        |> paragraph
            [ Font.center
            , width <| px 250
            , monospaceFont
            ]
    , [ [ img "/sui.png" [ height <| px 20 ]
        , text "Connect with Sui"
        ]
            |> row [ spacing 20 ]
            |> pillBtn (Just Connect) [ paddingXY 20 12 ]
            |> el [ centerX, popIn ]
      , text "[testnet]"
            |> el [ centerX, monospaceFont, Font.size 17 ]
      ]
        |> column [ spacing 10, centerX ]
    ]
        |> column [ centerX, paddingXY 0 40, spacing 40 ]


viewDash : Model -> String -> Element Msg
viewDash model wallet =
    [ [ text "Connected:"
      , viewWalletAddr wallet [ Font.bold ]
      , img "/copy.png" [ height <| px 20 ]
            |> btn (Just <| Copy wallet) []
      ]
        |> row [ spacing 10 ]
    , [ [ text "Create Chat"
            |> el [ Font.bold, titleFont, Font.size 30 ]
        , para "Open an encrypted chat with any Sui wallet." [ Font.size 15 ]
        ]
            |> row [ width fill, spacing 10 ]
      , Input.text [ width <| px 500 ]
            { label = Input.labelHidden ""
            , onChange = PartnerChange
            , placeholder =
                text "Wallet address"
                    |> Input.placeholder []
                    |> Just
            , text = model.partnerInput
            }
      , [ spinner 20
            |> when model.createInProgress
        , text "Submit"
            |> pillBtn
                (if model.createInProgress then
                    Nothing

                 else
                    Just CreateChat
                )
                []
        ]
            |> row [ spacing 10, alignRight ]
      ]
        |> column
            [ width fill
            , spacing 5
            , Border.rounded 10
            , Border.width 1
            , padding 10
            ]
    , viewChats model wallet
    ]
        |> column
            [ centerX
            , padding 20
            , spacing 20
            , height fill
            ]


inputBox : String -> Maybe String -> Bool -> Maybe Ports.WriteArgs -> Element Msg
inputBox input statusMsg isLive args =
    --inputBox : String -> Bool -> Element Msg
    Input.multiline
        [ --onPressEnter Send
          id "message-input"
        , Border.color Style.black
        , Border.width 2
        , padding 10
        , width fill

        --, Html.Attributes.disabled (not isLive)
        , Html.Attributes.disabled (isJust statusMsg)
            |> htmlAttribute
        , height <| px 100
        , statusMsg
            |> whenJust
                (\txt ->
                    paragraph
                        [ Font.center
                        , centerY
                        , monospaceFont
                        ]
                        [ text txt ]
                        |> el
                            [ height fill
                            , width fill
                            , Bg.color (rgba255 215 215 245 0.7)
                            ]
                )
            |> inFront
        ]
        { onChange = InputChange
        , spellcheck = True
        , text = input
        , label =
            button []
                { onPress =
                    --if isLive then
                    if statusMsg == Nothing then
                        --Just Send
                        --Just SendMsg
                        --Just <| WriteMessage args
                        args
                            |> Maybe.map WriteMessage

                    else
                        Nothing
                , label =
                    [ (if isLive then
                        text "send"

                       else
                        text "🚫"
                            |> el
                                [ Font.size 30
                                ]
                      )
                        |> el
                            [ padding 5
                            , id <|
                                if isLive then
                                    "send-message"

                                else
                                    "conn-lost"
                            , Bg.color black
                            , Font.color white
                            , Font.size 30
                            , Border.rounded 30
                            , paddingXY 20 5
                            , hover
                            ]
                    , spinner 20
                        |> el [ alignRight ]
                        |> when (isJust statusMsg)
                    ]
                        |> column [ spacing 5 ]
                }
                |> Input.labelRight []
        , placeholder = Nothing
        }


viewTyping : Posix -> Posix -> Element msg
viewTyping currentTime lastSeenTyping =
    when ((Time.posixToMillis currentTime - Time.posixToMillis lastSeenTyping) < 5000) <|
        el
            [ id "typing"
            , Font.size 30
            , centerX
            , Font.color Style.red
            ]
        <|
            text "TYPING!"


msgCard : String -> Message -> Element msg
msgCard otherWallet message =
    case message of
        Self content ->
            [ text "You"
                |> el [ Font.bold, Font.size 17, alignRight ]
            , paragraph [] [ text content ]
            ]
                |> column
                    [ Font.size 20
                    , Font.alignRight
                    , width fill
                    , padding 10
                    , Bg.color grey
                    , Border.rounded 10
                    , spacing 5
                    , popIn
                    ]

        Them content ->
            --paragraph (Style.msgThem ++ attrs) [ text content ]
            [ viewWalletAddr otherWallet [ Font.bold, Font.size 17, alignLeft ]
            , paragraph [] [ text content ]
            ]
                |> column
                    [ Font.size 20
                    , Font.alignLeft
                    , width fill
                    , padding 10
                    , Bg.color blu
                    , Border.rounded 10
                    , spacing 5
                    , popIn
                    ]


onScroll : (Json.Encode.Value -> msg) -> Attribute msg
onScroll msg =
    Json.Decode.map msg Json.Decode.value
        |> on "scroll"
        |> htmlAttribute


btn msg attrs elem =
    button (hover :: attrs)
        { onPress = msg
        , label = elem
        }


img src attrs =
    image attrs
        { src = src
        , description = ""
        }


hover : Attribute msg
hover =
    Element.mouseOver [ fade ]


fade : Element.Attr a b
fade =
    Element.alpha 0.6


pillBtn : Maybe msg -> List (Attribute msg) -> Element msg -> Element msg
pillBtn msg attrs =
    btn
        msg
        ([ Bg.color black
         , Font.color white
         , Border.rounded 20
         , paddingXY 20 10
         ]
            ++ attrs
        )


mainFont : Attribute msg
mainFont =
    Font.family [ Font.typeface "Open Sans" ]


titleFont : Attribute msg
titleFont =
    Font.family [ Font.typeface "Bebas Neue" ]


monospaceFont : Attribute msg
monospaceFont =
    Font.family [ Font.typeface "IBM Plex Mono" ]


viewChats : Model -> String -> Element Msg
viewChats model wallet =
    let
        ( chats, incoming, outgoing ) =
            model.loadedChats
                |> Dict.values
                |> List.foldl
                    (\chat ( live_, incoming_, outgoing_ ) ->
                        if isJust chat.otherPub && (isJust chat.myPub || chat.isCreator) then
                            ( chat :: live_, incoming_, outgoing_ )

                        else if not chat.isCreator && (chat.myPub == Nothing || chat.otherPub == Nothing) then
                            ( live_, chat :: incoming_, outgoing_ )

                        else
                            -- not chat.isCreator &&
                            -- (chat.myPub == Nothing || chat.otherPub == Nothing)
                            ( live_, incoming_, chat :: outgoing_ )
                    )
                    ( []
                    , []
                    , []
                    )

        section title xs =
            [ [ text title
                    |> el [ Font.bold, Font.size 30 ]
              , text "Refresh ⟳"
                    |> btn (Just RefreshChats) [ Font.underline, Font.size 18 ]
              ]
                |> row [ spaceEvenly, width fill ]
            , xs
                |> List.map (viewChatRow wallet model.chatView)
                |> column
                    [ spacing 30
                    , height fill
                    , scrollbarY
                    , width fill
                    ]
            ]
                |> column
                    [ spacing 20
                    , Border.width 1
                    , padding 20
                    , width fill
                    , height fill
                    , Border.rounded 10
                    ]
    in
    [ [ ( LiveChat, "Active:", List.length chats )
      , ( Incoming, "Incoming:", List.length incoming )
      , ( Outgoing, "Outgoing:", List.length outgoing )
      ]
        |> List.map
            (\( v, name, count ) ->
                text (name ++ " " ++ String.fromInt count)
                    |> (if model.chatView == v then
                            pillBtn (Just <| SetView v) []

                        else
                            btn (Just <| SetView v) [ Font.underline ]
                       )
            )
        |> row [ spacing 30 ]
    , case model.chatView of
        LiveChat ->
            section "Active chats" chats

        Incoming ->
            section "Incoming requests" incoming

        Outgoing ->
            section "Outgoing requests" outgoing
    ]
        |> column
            [ spacing 10
            , width fill
            , height fill
            ]


viewChatRow : String -> ChatDisc -> Ports.Chat -> Element Msg
viewChatRow wallet disc data =
    let
        partner =
            viewWalletShort data.otherWallet []
    in
    [ [ [ img "/label.png" [ width <| px 30 ]
        , text data.name
        ]
            |> row [ spacing 5, Border.width 1, paddingXY 10 5, Border.rounded 20 ]
      ]
        |> row [ width fill, spaceEvenly ]
    , [ [ text
            "w\\"
        , partner
        ]
            |> row [ spacing 5 ]
            |> when (disc == LiveChat)
      , if disc == Outgoing then
            [ text "Sent to:"
            , partner
            ]
                |> row [ spacing 5 ]

        else
            [ text "Created by:"
            , if data.isCreator then
                text "You"
                    |> el [ Font.bold ]

              else
                partner
            ]
                |> row [ spacing 5 ]
      ]
        |> row [ spaceEvenly, width fill ]
    , (case disc of
        LiveChat ->
            [ if data.myPub == Nothing then
                text "Create shared key"
                    |> pillBtn (Just (CreateMyPub wallet data.id)) []

              else
                text
                    (if data.myPriv == Nothing then
                        "Unlock"

                     else
                        "Select"
                    )
                    |> pillBtn (Just <| SelectChat data.id) []
            , text "Delete chat"
                |> btn (Just <| RejectChat data.id) [ Font.underline ]
            , text ("Messages: " ++ String.fromInt data.messages)
                |> el [ alignRight ]
                |> when (isJust data.myPub && isJust data.otherPub)
            ]

        Incoming ->
            [ if data.myPub == Nothing then
                text "Accept chat"
                    |> pillBtn (Just (CreateMyPub wallet data.id)) []

              else
                text "Waiting for key transfer"
                    |> el [ Font.italic ]
            , text "Reject chat"
                |> pillBtn (Just <| RejectChat data.id) []
            ]

        Outgoing ->
            [ text "Create shared key"
                |> pillBtn (Just (CreateMyPub wallet data.id)) []
                |> when (data.myPub == Nothing)
            , text "Cancel request"
                |> pillBtn (Just <| RejectChat data.id) []
            ]
      )
        |> row [ spacing 30, width fill ]
    ]
        |> column
            [ spacing 15
            , width fill
            , Border.width 1
            , padding 10
            , Border.rounded 15

            --, popIn
            ]



--fadeIn : Attribute msg
--fadeIn =
--style "animation" "fadeIn 1.5s"


popIn : Attribute msg
popIn =
    style "animation" "enter 0.3s"


linkOut : String -> List (Attribute msg) -> Element msg -> Element msg
linkOut url attrs elem =
    newTabLink
        (hover :: attrs)
        { url = url
        , label = elem
        }


viewWalletShort : String -> List (Attribute msg) -> Element msg
viewWalletShort val attrs =
    viewWalletAddr_ (String.left 10 val)
        val
        attrs


viewWalletAddr : String -> List (Attribute msg) -> Element msg
viewWalletAddr val attrs =
    viewWalletAddr_ (String.left 7 val ++ "..." ++ String.right 7 val)
        val
        attrs


viewWalletAddr_ : String -> String -> List (Attribute msg) -> Element msg
viewWalletAddr_ txt val attrs =
    text txt
        |> linkOut ("https://testnet.suivision.xyz/account/" ++ val)
            ([ hover
             , Font.underline
             ]
                ++ attrs
            )


para : String -> List (Attribute msg) -> Element msg
para txt attrs =
    [ text txt ]
        |> paragraph attrs


id : String -> Attribute msg
id =
    Html.Attributes.id
        >> htmlAttribute


rotate : Attribute msg
rotate =
    Html.Attributes.style "animation" "rotation 2s infinite linear"
        |> Element.htmlAttribute


spinner : Int -> Element msg
spinner size =
    Img.notch size
        |> el
            [ rotate
            ]


circleButton : Element Msg
circleButton =
    [ text "Create chat" ]
        |> paragraph [ centerX, centerY, Font.center, titleFont ]
        |> el
            [ width <| px 100
            , height <| px 100
            , Font.color white
            , Bg.color black
            , Border.rounded 50
            , centerY
            , Element.pointer
            , onClick CreateChat
            , id "start-circle"
            , centerX
            , hover
            ]
