import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Easing } from "react-native";
import PageContainer from "../components/PageContainer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { Entypo, Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
import colors from "../constants/colors";
import Bubble from "../components/Bubble";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { CreateMessageRequest, Message, MessageDto, MessageType } from "../models/Message";
import agent from "../api/agent";
import ProfileImage from "../components/ProfileImage";
import { API_IP_PORT } from "../constants/hosts";
import SockJS from "sockjs-client";
import { Client, Frame } from "stompjs";
import stompjs from "stompjs";
import { updateChatsData, updateUserChatsData } from "../stores/chatsSlice";
import { CreateChatRequest } from "../models/Chat";
import CustomMenuItem from "../components/CustomMenuItem";
import { Menu, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";
import ReplyTo from "../components/ReplyTo";
import { launchImagePicker, openCamera, shootVideo, uploadImageAsync } from "../utils/imagePickerHelper";
import { Audio, ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { MediaStream, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { peerConstraints, sessionConstraints } from "../utils/webRTCUtils";
import { getStream } from "../utils/actions/userMediaActions";
import { setGettingCall, setLocalStreamUrl, setRemoteStreamUrl } from "../stores/webRtcSlice";

var stompClient: Client | null = null;

const ChatScreen = (props: any) => {
    const dispatch = useDispatch();
    const [messageText, setMessageText] = useState("");
    const [chatId, setChatId] = useState(props.route?.params?.chatId);
    const [errorBannerText, setErrorBannerText] = useState("");
    const [replyingTo, setReplyingTo] = useState("");
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tempImageUri, setTempImageUri] = useState("");
    const [tempVideoUri, setTempVideoUri] = useState("");
    const [microphoneSize, setMicrophoneSize] = useState(40);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [tempAudioUri, setTempAudioUri] = useState("");

    const flatList = useRef<FlatList<any>>(null);
    const menuRef = useRef<any>(null);
    const attachmentMenuRef = useRef<any>(null);

    const storedChats = useSelector((state: RootState) => state.chats.chatsData);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const storedUserChats = useSelector((state: RootState) => state.chats.userChatsData);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);
    const newChatData = props.route?.params?.newChatData;
    const [chatData, setChatData] = useState((chatId && storedChats[chatId]) || (props.route?.params?.newChatData as CreateChatRequest));
    const [isGroupChat, setIsGroupChat] = useState(props.route?.params?.isGroupChat ?? false);

    // console.log("chatId chat screen: " + chatId);

    useEffect(() => {
        if (chatId) {
            var socket = new SockJS(`${API_IP_PORT}/ws`);
            stompClient = stompjs.over(socket); 
            // stompClient.debug = (str: string) => {
            //     console.log(new Date(), str);
            // };
            stompClient.connect({}, onConnected, onErrorHandler);
        };
    }, [chatId]);

    function onConnected(frame?: Frame | undefined) {
        // console.log("Connected: " + frame);
        stompClient?.subscribe(`/user/${chatId}/message`, onMessageReceived);
    }
    
    function onErrorHandler(error: string | Frame) {
        console.log("Error: " + error);
    }

    function onMessageReceived(message: stompjs.Message) {
        const payloadData = JSON.parse(message.body) as MessageDto;
        var newChatMessage = {
            ...payloadData,
            createdAt: new Date(payloadData.createdAt)
        };
        let userChat = Object.values(storedUserChats).find(i => i.chat.id === chatId);
        let chat = storedChats[chatId];
        // console.log("onmessagedata: " + userChat + " " + chat);
        if (userChat) {
            userChat.chat.latestMessage = newChatMessage.messageType === MessageType.IMAGE ? "Photo" : newChatMessage.message;
            userChat.chat.updatedAt = (new Date()).toISOString();
            chat.latestMessage = newChatMessage.messageType === MessageType.IMAGE ? "Photo" : newChatMessage.message;
            chat.updatedAt = (new Date()).toISOString();
            dispatch(updateUserChatsData({ userChat: userChat }));
            dispatch(updateChatsData({ chat: chat }));
        }
        // console.log("NewChatMessage: ", newChatMessage);
        if (!chatMessages.includes(newChatMessage)) setChatMessages(prev => [...prev, newChatMessage]);
    }

    useEffect(() => {
        (
            async () => {
                if (!chatId) return;

                try {
                    setIsLoading(true);

                    const chatMessagesArr = await agent.MessageRequests.getChatMessagesRequest(chatId);

                    if (!chatMessagesArr) return;

                    let chatMessagesArrCopy: Message[] = [];
                    for (let i = 0; i < chatMessagesArr.length; i++) {
                        const message = chatMessagesArr[i];
                        chatMessagesArrCopy.push({
                            ...message,
                            createdAt: new Date(message.createdAt)
                        });
                    }

                    setChatMessages(chatMessagesArrCopy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            }
        )();
    }, []);

    useEffect(() => {
        setChatId(props.route?.params?.chatId);
    }, [props.route?.params]);

    useEffect(() => {
        setChatData((chatId && storedChats[chatId]) || (props.route?.params?.newChatData as CreateChatRequest));
        setIsGroupChat(props.route?.params?.isGroupChat ?? false);
    }, [props.route?.params]);

    const getChatTitle = useCallback(() => {
        if (!chatData || !userData) return "";
        if (isGroupChat) return chatData.chatName ?? "";
        
        let otherUserPhoneNumber = chatData.memberPhoneNumbers.find((i: any) => i !== userData?.phoneNumber);
        if (!otherUserPhoneNumber) return "Chat";

        let otherUser = storedUsers[otherUserPhoneNumber];

        return storedContacts[otherUserPhoneNumber]?.displayName ?? otherUser?.displayName ?? otherUserPhoneNumber;
    }, [chatData, userData]);

    const getChatImageUrl = () => {
        if (!chatData || !userData) return "";
        if (isGroupChat) return chatData.chatImageUrl ?? null;
        
        let otherUserPhoneNumber = chatData.memberPhoneNumbers.find((i: any) => i !== userData?.phoneNumber);
        if (!otherUserPhoneNumber) return null;

        let otherUser = storedUsers[otherUserPhoneNumber];

        // console.log("otherUser: ", otherUser);

        return otherUser?.profilePictureUrl ?? null;
    };

    useEffect(() => {
        if (!chatData || !userData) return;
        props.navigation.setOptions({
            headerTitle: getChatTitle(),
            headerLeft: () => {
                return (
                    <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                        <TouchableOpacity
                            onPress={() => props.navigation.goBack()}
                            style={{ flexDirection: "row", alignItems: "center" }}
                        >
                            <>
                                <Item
                                    title="Back"
                                    iconName="arrow-back"
                                    color="white"
                                    style={{ marginLeft: -20 }}
                                    onPress={() => props.navigation.goBack()}
                                />
                                <ProfileImage 
                                    uri={getChatImageUrl()}
                                    style={{ marginRight: 10, marginLeft: -5 }}
                                    size={40}
                                    title={getChatTitle()}
                                />
                            </>
                        </TouchableOpacity>
                    </HeaderButtons>
                );
            },
            headerRight: () => {
                return (
                    <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                        {
                            !isGroupChat && (
                                <Item 
                                    title="Video Call"
                                    iconName="videocam"
                                    color="white"
                                    onPress={props?.create}
                                />
                            )
                        }
                        <Item 
                            title="Options"
                            iconName="ellipsis-vertical"
                            color="white"
                            onPress={() => {
                                if (menuRef?.current)
                                // @ts-ignore
                                    menuRef.current.props.ctx.menuActions.openMenu("ChatScreenMenu");
                            }}
                            style={{ marginRight: -20 }}
                        />

                        <Menu name="ChatScreenMenu" ref={menuRef}>
                            <MenuTrigger />
                            
                            <MenuOptions>
                                <CustomMenuItem 
                                    text={isGroupChat ? "Group Info" : "View Contact"}
                                    iconPack={Ionicons}
                                    icon="information-circle-outline"
                                    onSelect={() => {
                                        isGroupChat ? 
                                        props.navigation.navigate("ChatSettings", { chatId }) :
                                        props.navigation.navigate("Contact", { uid: chatData.memberPhoneNumbers.filter((number: any) => number !== userData?.phoneNumber) })
                                    }}
                                />

                            </MenuOptions>
                        </Menu>
                    </HeaderButtons>
                );
            },
        });
    }, []) ;

    const sendMessageHandler = useCallback(async () => {
        if (!userData) return;

        if (messageText.trim() === "") return;

        try {
            setIsLoading(true);

            const newMessage: CreateMessageRequest = {
                message: messageText,
                chatId: chatId,
                senderPhoneNumber: userData.phoneNumber,
                replyToMessageId: replyingTo ? replyingTo : null,
                messageType: MessageType.TEXT,
                mediaUrl: null
            };

            if (stompClient) {
                stompClient.send(`/app/chat`, {}, JSON.stringify(newMessage));
            }

            // sendMessage(newMessage);

            setMessageText("");
            setReplyingTo("");
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setErrorBannerText("Error sending message");
            setTimeout(() => setErrorBannerText(""), 3000);
            setIsLoading(false);
        }
    }, [messageText, chatId]);

    const sendImage = useCallback(async () => {
        if (!userData) return;

        const messageTextCopy = messageText.trim() ?? "";

        try {
            setIsLoading(true);

            const uploadUrl = await uploadImageAsync(tempImageUri);
            
            const newMessage: CreateMessageRequest = {
                message: messageTextCopy,
                chatId: chatId,
                senderPhoneNumber: userData.phoneNumber,
                replyToMessageId: replyingTo ? replyingTo : null,
                messageType: MessageType.IMAGE,
                mediaUrl: uploadUrl
            }
            
            if (stompClient) {
                stompClient.send(`/app/chat`, {}, JSON.stringify(newMessage));
            }
            
            setIsLoading(false);

            setMessageText("");
            setReplyingTo("");
            setTimeout(() => setTempImageUri(""), 500);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [isLoading, tempImageUri, chatId, messageText])

    const sendVideo = useCallback(async () => {
        if (!userData) return;

        const messageTextCopy = messageText.trim() ?? "";

        try {
            setIsLoading(true);

            const uploadUrl = await uploadImageAsync(tempVideoUri);
            
            const newMessage: CreateMessageRequest = {
                message: messageTextCopy,
                chatId: chatId,
                senderPhoneNumber: userData.phoneNumber,
                replyToMessageId: replyingTo ? replyingTo : null,
                messageType: MessageType.VIDEO,
                mediaUrl: uploadUrl
            }
            
            if (stompClient) {
                stompClient.send(`/app/chat`, {}, JSON.stringify(newMessage));
            }
            
            setIsLoading(false);

            setMessageText("");
            setReplyingTo("");
            setTimeout(() => setTempImageUri(""), 500);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [isLoading, tempVideoUri, chatId, messageText])

    const getReplyToName = useCallback((phoneNumber: string) => {
        if (userData?.phoneNumber === phoneNumber) return "You";
        if (storedContacts[phoneNumber]?.displayName) return storedContacts[phoneNumber]?.displayName;
        if (storedUsers[phoneNumber]?.displayName) return storedUsers[phoneNumber]?.displayName;
        return phoneNumber;
    }, [replyingTo]);

    const takePhoto = useCallback(async () => {
        setTempImageUri("");
        try {
            const tempUri = await openCamera();
            if (!tempUri) return;

            // console.log("tempUri: ", tempUri);
            setTempImageUri(tempUri);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [tempImageUri]);

    const takeVideo = useCallback(async () => {
        setTempImageUri("");
        try {
            const tempUri = await shootVideo();
            if (!tempUri) return;

            // console.log("tempUri: ", tempUri);
            setTempVideoUri(tempUri);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [tempVideoUri]);

    const pickImage = useCallback(async () => {
        setTempImageUri("");
        try {
            const tempUri = await launchImagePicker();
            if (!tempUri) return;

            setTempImageUri(tempUri);
        } catch (error) {
            console.log(error);
        }
    }, [tempImageUri, messageText]);

    const startRecording = async () => {
        try {
            console.log("Requesting permissions..");
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log("Starting recording..");
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            console.log("Recording started");
        } catch (error) {
            console.log(error);
        }
    }

    const stopRecording = async () => {
        console.log("Stopping recording..");
        setRecording(null);
        await recording?.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        const uri = recording?.getURI();
        console.log("Recording stopped and stored at", uri);
        setTempAudioUri(uri ?? "");
    }

    const sendAudioMessage = useCallback(async () => {
        if (!userData) return;

        const messageTextCopy = messageText.trim() ?? "";
        console.log(tempAudioUri);

        try {
            setIsLoading(true);

            const uploadUrl = await uploadImageAsync(tempAudioUri);

            const newMessage: CreateMessageRequest = {
                message: "",
                chatId: chatId,
                senderPhoneNumber: userData.phoneNumber,
                replyToMessageId: replyingTo ? replyingTo : null,
                messageType: MessageType.AUDIO,
                mediaUrl: uploadUrl
            }

            if (stompClient) {
            stompClient.send(`/app/chat`, {}, JSON.stringify(newMessage));
            }

            setIsLoading(false);

            setMessageText("");
            setReplyingTo("");
            setTimeout(() => setTempAudioUri(""), 500);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [isLoading, tempAudioUri, chatId, messageText])

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.screen} behavior={ Platform.OS === "ios" ? "padding" : undefined } keyboardVerticalOffset={100}>

                <PageContainer style={styles.backgroundImage}>

                        {
                            chatMessages.length === 0 && !isLoading && (
                                <Bubble text="This is a new chat. Say hi!" type="system" />
                            )
                        }

                        {
                            errorBannerText !== "" && (
                                <Bubble text={errorBannerText} type="error" />
                            )
                        }

                        {
                            chatId && chatMessages.length > 0 && (
                                <FlatList 
                                    style={{
                                        marginVertical: 10,
                                    }}
                                    keyExtractor={(item) => item.id.toString()}
                                    data={chatMessages}
                                    // @ts-ignore
                                    ref={(ref) => flatList.current = ref}
                                    onContentSizeChange={() => chatMessages.length > 0 && flatList.current?.scrollToEnd({ animated: false })}
                                    onLayout={() => flatList.current?.scrollToEnd({ animated: false })}
                                    renderItem={itemData => {
                                        const message = itemData.item;

                                        const sender = message.senderPhoneNumber && storedUsers[message.senderPhoneNumber];
                                        const name = sender && sender.displayName;

                                        let messageType;
                                        switch (message.messageType) {
                                            case MessageType.TEXT:
                                                if (message.senderPhoneNumber === userData?.phoneNumber) messageType = "sent";
                                                else messageType = "received";
                                                break;
                                            case MessageType.IMAGE:
                                                if (message.senderPhoneNumber === userData?.phoneNumber) messageType = "sent";
                                                else messageType = "received";
                                                break;
                                            case MessageType.VIDEO:
                                                if (message.senderPhoneNumber === userData?.phoneNumber) messageType = "sent";
                                                else messageType = "received";
                                                break;
                                            case MessageType.AUDIO:
                                                if (message.senderPhoneNumber === userData?.phoneNumber) messageType = "audioSent";
                                                else messageType = "audioReceived";
                                                break;
                                            case MessageType.DOCUMENT:
                                                break;
                                            case MessageType.INFO:
                                                messageType = "system";
                                                break;
                                        }

                                        return (
                                            <Bubble 
                                                text={message?.message} 
                                                type={messageType} 
                                                messageId={message.id.toString()}
                                                userId={userData?.phoneNumber}
                                                chatId={chatId}
                                                senderPhoneNumber={message.senderPhoneNumber}
                                                date={message.createdAt}
                                                name={chatData.chatType != "GROUPCHAT" || message.senderPhoneNumber === userData?.phoneNumber ? undefined : name}
                                                setReply={() => setReplyingTo(message.id.toString())}
                                                replyingTo={message.replyToMessageId && chatMessages.find(i => i.id === message.replyToMessageId)}
                                                imageUrl={message?.messageType === MessageType.IMAGE && message?.mediaUrl}
                                                videoUrl={message?.messageType === MessageType.VIDEO && message?.mediaUrl}
                                                audioUrl={message?.messageType === MessageType.AUDIO && message?.mediaUrl}

                                            />
                                        );
                                    }}
                                />
                            )
                        }

                        {
                            isLoading && (
                                <ActivityIndicator size="large" color={colors.primary} />
                            )
                        }

                </PageContainer>

                {
                    replyingTo !== "" && (
                        <ReplyTo 
                            text={chatMessages.find(i => i.id === replyingTo)?.message}
                            name={getReplyToName(chatMessages.find(i => i.id === replyingTo)?.senderPhoneNumber ?? "")}
                            onCancel={() => setReplyingTo("")}
                            type={chatMessages.find(i => i.id === replyingTo)?.messageType}
                        />
                    )
                }

                <View style={styles.inputContainer}>
                    {
                        recording ? (
                            <View style={styles.recordingContainer}>
                                <View style={styles.recordingIndicator} />
                                <Text style={styles.recordingText}>Recording..</Text>
                                <TouchableOpacity onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setMicrophoneSize(40);
                                    stopRecording().then(() => {
                                        sendAudioMessage();
                                    });
                                }}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close-circle" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            tempImageUri === "" && tempVideoUri === "" && (
                                <TextInput style={styles.textbox} placeholder="Write a message..." onChangeText={text => setMessageText(text)} value={messageText} onSubmitEditing={() => {}} />
                            )
                        )
                    }

                    <Menu 
                        name="AttachmentMenu" 
                        ref={attachmentMenuRef}
                        renderer={renderers.SlideInMenu}
                        rendererProps={{ 
                            preferredPlacement: "bottom",
                            anchorStyle: { backgroundColor: colors.primary },
                            placementOffsetY: 0,
                            placementOffsetX: 0,
                            anchorPosition: { top: 0, left: 0 },
                            animationDuration: 100,
                            animationEasing: Easing.ease,
                            animationConfig: undefined,
                            useNativeDriver: false,
                        }}
                    >
                        <MenuTrigger />
                        
                        <MenuOptions>
                            <CustomMenuItem 
                                text={"Take a picture"}
                                icon="camera"
                                onSelect={() => takePhoto()}
                            />

                            <CustomMenuItem 
                                text={"Take a video"}
                                icon="video-camera"
                                iconPack={FontAwesome}
                                onSelect={() => takeVideo()}
                            />

                            <CustomMenuItem 
                                text={"Send media"}
                                icon="perm-media"
                                iconPack={MaterialIcons}
                                onSelect={() => pickImage()}
                            />
                        </MenuOptions>
                    </Menu>

                    {
                        !recording && (
                            <>
                                <TouchableOpacity 
                                    onPress={() => {
                                        if (attachmentMenuRef?.current)
                                        // @ts-ignore
                                        attachmentMenuRef.current.props.ctx.menuActions.openMenu("AttachmentMenu");
                                    }}
                                    style={{ backgroundColor: colors.pink, width: 40, height: 40, marginRight: 10, ...styles.attachmentButton}}>
                                    <Entypo name="attachment" size={20} color="white" />
                                </TouchableOpacity>

                                {
                                    messageText === "" ? (
                                        <TouchableOpacity
                                            onPressIn={() => setMicrophoneSize(70)} 
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                startRecording();
                                            }} 
                                            style={{ 
                                                backgroundColor: colors.primary, 
                                                width: microphoneSize,
                                                height: microphoneSize,
                                                alignSelf: recording ? "flex-end" : "center",
                                                ...styles.attachmentButton
                                            }} 
                                            disabled={isLoading}
                                        >
                                            <MaterialCommunityIcons name="microphone-outline" size={20} color="white" />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={sendMessageHandler} style={{ backgroundColor: colors.primary, ...styles.attachmentButton}} disabled={isLoading}>
                                            <Feather name="send" size={20} color="white" />
                                        </TouchableOpacity>
                                    )
                                }
                            </>
                        ) 
                    }


                    <AwesomeAlert 
                        show={tempImageUri !== ""}
                        title="Send image?"
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText='Cancel'
                        confirmText='Send image'
                        confirmButtonColor={colors.primary}
                        cancelButtonColor={colors.red}
                        titleStyle={styles.popupTitleStyle}
                        onCancelPressed={() => setTempImageUri("")}
                        onConfirmPressed={sendImage}
                        onDismiss={() => setTempImageUri("")}
                        customView={(
                            <View>
                                {
                                    isLoading && (
                                        <ActivityIndicator size="large" color={colors.primary} />
                                    )
                                }
                                {
                                    !isLoading && tempImageUri !== "" && (
                                        <Image source={{ uri: tempImageUri }} style={{ width: 200, height: 200 }} />
                                    )
                                }
                                <TextInput 
                                    placeholder="Write a message..." 
                                    onChangeText={text => setMessageText(text)} 
                                    value={messageText} 
                                    onSubmitEditing={() => {}} 
                                    style={{ maxWidth: 200 }}
                                />
                            </View>
                        )}
                    />

                    <AwesomeAlert 
                        show={tempVideoUri !== ""}
                        title="Send video?"
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText='Cancel'
                        confirmText='Send video'
                        confirmButtonColor={colors.primary}
                        cancelButtonColor={colors.red}
                        titleStyle={styles.popupTitleStyle}
                        onCancelPressed={() => setTempVideoUri("")}
                        onConfirmPressed={sendVideo}
                        onDismiss={() => setTempVideoUri("")}
                        customView={(
                            <View>
                                {
                                    isLoading && (
                                        <ActivityIndicator size="large" color={colors.primary} />
                                    )
                                }
                                {
                                    !isLoading && tempVideoUri !== "" && (
                                        <Video
                                            source={{
                                                uri: tempVideoUri
                                            }}
                                            useNativeControls
                                            resizeMode={ResizeMode.CONTAIN}
                                            style={{ width: 200, height: 200 }}
                                            isLooping
                                            shouldPlay={true}
                                        />
                                    )
                                }
                                <TextInput 
                                    placeholder="Write a message..." 
                                    onChangeText={text => setMessageText(text)} 
                                    value={messageText} 
                                    onSubmitEditing={() => {}} 
                                    style={{ maxWidth: 200 }}
                                />
                            </View>
                        )}
                    />
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "white"
    },
    screen: {
        flex: 1
    },
    backgroundImage: {
        flex: 1,
    },
    inputContainer: {
        backgroundColor: "white",
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 10,
        height: 50,
        marginBottom: 10,
    },
    textbox: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: colors.extraLightGrey,
        marginHorizontal: 15,
        paddingHorizontal: 20,
        height: 40,
        fontFamily: "regular",
        fontSize: 12,
        letterSpacing: 0.3,
    },
    attachmentButton: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        color: "white",
    },
    sendButton: {
        backgroundColor: colors.blue,
        borderRadius: 50,
        padding: 8,
        width: 35,
    },
    popupTitleStyle: {
        fontFamily: "medium",
        letterSpacing: 0.3,
        color: colors.textColor
    },
    headerTitleStyle: {
        fontFamily: "medium",
        color: "white",
        fontSize: 15,
        letterSpacing: 0.3,
        alignSelf: "center",
    },
    recordingContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    recordingText: {
        color: "white",
        fontFamily: "regular",
        fontSize: 12,
        letterSpacing: 0.3,
        marginLeft: 10
    },
    recordingIndicator : {
        width: 10,
        height: 10,
        borderRadius: 50,
        backgroundColor: "red",
        marginRight: 10
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        borderRadius: 50,
        padding: 5
    }
})

export default ChatScreen;



