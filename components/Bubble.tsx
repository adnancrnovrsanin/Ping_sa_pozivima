import { StyleSheet, View, TouchableWithoutFeedback, Text, Image, Button, TouchableOpacity } from "react-native"
import colors from "../constants/colors";
import { StyleHTMLAttributes, useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { LinearGradient } from "expo-linear-gradient";
import { MessageType } from "../models/Message";
import { AVPlaybackStatusSuccess, Audio, ResizeMode, Video } from "expo-av";
import ProfileImage from "./ProfileImage";

function formatAmPm(dateString: string) {
    const date = new Date(dateString);
    var hours = date.getHours();
    var minutes: any = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

const MenuItem = (props: any) => {

    const Icon = props.iconPack ?? Feather;

    return (
        <MenuOption onSelect={props.onSelect}>
            <View style={styles.menuItemContainer}>
                <Text style={styles.menuText}>{props.text}</Text>
                <Icon name={props.icon} size={20} />
            </View>
        </MenuOption>
    );
}

const Bubble = (props: any) => {

    const { text, type, messageId, chatId, userId, date, setReply, replyingTo, name, imageUrl, videoUrl, audioUrl, senderPhoneNumber } = props;

    // const starredMessages = useSelector((state: RootState) => state.messages.starredMessages[chatId] ?? {});
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);
    const userData = useSelector((state: RootState) => state.auth.userData);

    const [videoPlayStatus, setVideoPlayStatus] = useState({});
    const [audioPlayStatus, setAudioPlayStatus] = useState(false);
    const [audio, setAudio] = useState<Audio.Sound | null>(null)
    const [playbackDuration, setPlaybackDuration] = useState<number | null>(null);
    const [playbackPosition, setPlaybackPosition] = useState<number | null>(null);

    const videoRef = useRef<Video | null>(null);

    const bubbleStyle: any = {
        ...styles.container,
    };

    const textStyle: any = {
        ...styles.text,
    };

    const wrapperStyle: any = {
        ...styles.wrapperStyle,
    };

    const nameStyle: any = {
        ...styles.name
    }

    const menuRef = useRef(null);
    const id = useRef(uuid.v4());
    // @ts-ignore
    if (!type) type = ""; 

    let Container: any = View;

    switch(type) {
        case "system":
            textStyle.color = "#65644A";
            textStyle.textAlign = "center";
            bubbleStyle.backgroundColor = colors.beige;
            bubbleStyle.alignItems = "center";
            bubbleStyle.marginTop = 10;
            break;
        case "error":
            bubbleStyle.backgroundColor = colors.red;
            textStyle.color = "white";
            bubbleStyle.marginTop = 10;
            break;
        case "sent":
            wrapperStyle.justifyContent = "flex-end";
            bubbleStyle.backgroundColor = colors.primary;
            bubbleStyle.maxWidth = "90%";
            textStyle.color = "white";
            Container = TouchableWithoutFeedback;
            break;
        case "received":
            wrapperStyle.justifyContent = "flex-start";
            bubbleStyle.maxWidth = "90%";
            bubbleStyle.backgroundColor = colors.extraLightGrey;
            Container = TouchableWithoutFeedback;
            break;
        case "reply":
            bubbleStyle.backgroundColor = "#F2F2F2";
            textStyle.color = colors.textColor;
            bubbleStyle.borderLeftWidth = 5;
            bubbleStyle.borderColor = colors.lightBlueGreen;
            break;
        case "info":
            bubbleStyle.backgroundColor = "white";
            bubbleStyle.alignItems = "center";
            textStyle.color = colors.textColor;
            textStyle.textAlign = "center";
            textStyle.fontSize = 10;
            bubbleStyle.marginTop = 10;
            bubbleStyle.marginBottom = 20;
            break;
        case "audioSent":
            wrapperStyle.justifyContent = "flex-end";
            bubbleStyle.backgroundColor = colors.primary;
            bubbleStyle.maxWidth = "90%";
            textStyle.color = "white";
            Container = TouchableWithoutFeedback;
            break;
        case "audioReceived":
            wrapperStyle.justifyContent = "flex-start";
            bubbleStyle.maxWidth = "90%";
            bubbleStyle.backgroundColor = colors.extraLightGrey;
            Container = TouchableWithoutFeedback;
            break;
        default:
            break;
    }

    const copyToClipboard = async () => await Clipboard.setStringAsync(text);

    // const isStarred = starredMessages[messageId] !== undefined;

    const dateString = date && formatAmPm(date);

    // const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

    const getReplyToText = () => {
        if (replyingTo.messageType === MessageType.IMAGE)
            return "Photo";
        return replyingTo.message;
    }

    useEffect(() => {
        // @ts-ignore
        if (videoPlayStatus?.didJustFinish) {
            videoRef.current?.playFromPositionAsync(0).then(() => videoRef.current?.pauseAsync());
        }
    }, [videoPlayStatus]);



    const playAudio = async () => {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync({ uri: audioUrl });
            setAudio(soundObject);
            soundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
                if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
                    setPlaybackDuration(playbackStatus.durationMillis ?? null);
                    setPlaybackPosition(playbackStatus.positionMillis ?? null);
                }

                playbackStatus = playbackStatus as AVPlaybackStatusSuccess;
                if (playbackStatus) {
                    if (playbackStatus.didJustFinish) {
                        setAudioPlayStatus(false);
                        setPlaybackDuration(null);
                        setPlaybackPosition(null);
                    }
                }
            });
            await soundObject.playAsync();
            setAudioPlayStatus(true);
        } catch (error) {
            console.log(error);
        }
    }

    const pauseAudio = async () => {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync({ uri: audioUrl });
            await soundObject.pauseAsync();
            setAudioPlayStatus(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return audio
            ? () => {
                console.log('Unloading audio');
                audio.unloadAsync();
            }
            : undefined;
    }, [audio]);

    return (
        <View style={wrapperStyle}>
            
            <Container style={{ 
                width: "100%"
            }} onLongPress={() => {
                Haptics.selectionAsync();
                // @ts-ignore
                menuRef.current.props.ctx.menuActions.openMenu(id.current);
            }}>
                <View style={bubbleStyle}>
                    {
                        name && !["system", "info"].includes(type) && (
                            <Text style={nameStyle}>
                                {name === userData?.phoneNumber ? ("You") : storedContacts[name]?.displayName ?? storedUsers[name]?.displayName ?? name}
                            </Text>
                        )
                    }

                    {
                        replyingTo && (
                            <Bubble 
                                type="reply"
                                text={getReplyToText()}
                                name={replyingTo.senderPhoneNumber}
                            />
                        )
                    }

                    {
                        imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />
                    }

                    {
                        videoUrl && (
                            <View>
                                <Video
                                    ref={videoRef} 
                                    source={{ uri: videoUrl }} 
                                    style={styles.image}
                                    resizeMode={ResizeMode.CONTAIN}
                                    onPlaybackStatusUpdate={status => setVideoPlayStatus(() => status)}
                                    isLooping={false}
                                    useNativeControls
                                />
                                {/* {
                                    // @ts-ignore
                                    !videoPlayStatus.isPlaying && (
                                        <TouchableOpacity
                                            // @ts-ignore
                                            onPress={() => videoRef.current.playAsync()}
                                            style={styles.playButton}
                                        >
                                            <Ionicons name="play" size={24} color="black" />
                                        </TouchableOpacity>
                                    )
                                } */}
                            </View>
                        )
                    }

                    {
                        text && (
                            <Text style={textStyle}>
                                {text}
                            </Text>
                        )
                    }

                    {
                        ["audioSent", "audioReceived"].includes(type) && audioUrl && (
                            <View style={styles.audioContainer}>
                                <ProfileImage 
                                    size={40}
                                    uri={userData?.phoneNumber === senderPhoneNumber ? userData?.profilePictureUrl ?? null : storedUsers[senderPhoneNumber]?.profilePictureUrl ?? null}
                                    style={styles.audioProfileImage}
                                />

                                {
                                    !audioPlayStatus ? (
                                        <View style={styles.audioPlayContainer}>
                                            <TouchableOpacity onPress={() => {
                                                playAudio();
                                            }}>
                                                <Ionicons name="play" size={30} color={type === "audioSent" ? "white" : "black"} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.audioPlayContainer}>
                                            <TouchableOpacity onPress={() => {
                                                pauseAudio();
                                            }}>
                                                <Ionicons name="pause" size={30} color={type === "audioSent" ? "white" : "black"} />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }

                                <View style={{
                                    ...styles.audioBarContainer,
                                    backgroundColor: type === "audioSent" ? colors.extraLightGrey : "black"
                                }}>
                                    <View style={{ 
                                        ...styles.audioBar,
                                        width: playbackDuration !== null && playbackPosition !== null ? `${(playbackPosition / playbackDuration) * 100}%` : 0,
                                    }} />
                                </View>

                                {/* <View style={styles.audioTimeContainer}>
                                    <Text style={styles.audioTime}>{audioTime}</Text>
                                </View> */}
                            </View>
                        )
                    }


                    {
                        dateString && !["system", "info"].includes(type) && <View style={styles.timeContainer}>
                            {/* { isStarred && <FontAwesome name="star" size={14} color={colors.textColor} style={{ marginRight: 5 }} /> } */}
                            <Text style={{ ...styles.time, color: type === "sent" ? colors.lightGrey : colors.grey}}>
                                {dateString}
                            </Text>
                        </View>
                    }

                    <Menu name={id.current as string} ref={menuRef}>
                        <MenuTrigger />

                        <MenuOptions>
                            <MenuItem text="Copy to clipboard" icon="copy" onSelect={copyToClipboard} />
                            {/* <MenuItem text={`${isStarred ? 'Unstar' : 'Star'} message`} icon={isStarred ? 'star' : 'star-o'} iconPack={FontAwesome} onSelect={() => starMessage(messageId, chatId, userId)} /> */}
                            <MenuItem text="Reply" icon="corner-up-left" onSelect={setReply} />
                        </MenuOptions>
                    </Menu>
                </View>
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: "row",
        justifyContent: "center",
    },
    text: {
        fontFamily: "regular",
        letterSpacing: 0.3,
        marginRight: 20,
    },
    container: {
        backgroundColor: "white",
        borderRadius: 6,
        padding: 5,
        marginBottom: 10,
    },
    menuItemContainer: {
        flexDirection: "row",
        padding: 5
    },
    menuText: {
        flex: 1,
        fontFamily: "regular",
        letterSpacing: 0.3,
        fontSize: 16,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    time: {
        fontFamily: "regular",
        letterSpacing: 0.3,
        fontSize: 10,
    },
    name: {
        fontFamily: "medium",
        letterSpacing: 0.3,
        marginRight: 20,
        marginBottom: 2,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 5,
    },
    playButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
        width: 35,
        height: 35,
        borderRadius: 100,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    audioContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: 200,
    },
    audioBarContainer: {
        flex: 1,
        height: 3,
        borderRadius: 100,
        marginRight: 5,
    },
    audioBar: {
        height: 3,
        backgroundColor: colors.lightBlueGreen,
        borderRadius: 100,
    },
    audioTimeContainer: {
        width: 40,
        alignItems: "flex-end",
    },
    audioTime: {
        fontFamily: "regular",
        letterSpacing: 0.3,
        fontSize: 10,
    },
    audioPlayContainer: {
        width: 40,
        alignItems: "flex-end",
        marginRight: 5,
    },
    audioProfileImage: {
        marginRight: 5,
    }
});

export default Bubble;