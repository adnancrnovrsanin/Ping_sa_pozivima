import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import PageContainer from "../components/PageContainer";
import colors from "../constants/colors";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { getUserChats, getUserChatsReturned, removeUserFromChat } from "../utils/actions/chatActions";
import { Chat, UserChat } from "../models/Chat";
import ProfileImage from "../components/ProfileImage";
import DataItem from "../components/DataItem";
import SubmitButton from "../components/SubmitButton";

const ContactScreen = (props: any) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const currentUserData = storedUsers[props.route?.params?.uid] ?? null;
    const storedChats = useSelector((state: RootState) => state.chats.chatsData);
    const [commonChats, setCommonChats] = useState<UserChat[]>([]);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);

    const chatId = props.route?.params?.chatId;
    const chatData = chatId && storedChats[chatId];

    useEffect(() => {
        (
            async () => {
                const currentUserChats = await getUserChatsReturned(currentUserData?.phoneNumber);
                setCommonChats(
                    currentUserChats.filter(chat => chat.chat.memberPhoneNumbers.includes(userData?.phoneNumber ?? "") && chat.chat.chatType === "GROUPCHAT")
                );
            }
        )();
    }, []);

    const removeFromChat = useCallback(async () => {
        try {
            setIsLoading(true);

            await removeUserFromChat(userData, chatId, currentUserData);

            props.navigation.goBack();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, props.navigation]);

    return (
        <PageContainer>
            <View style={styles.topContainer}>
                <ProfileImage 
                    uri={currentUserData?.profilePictureUrl}
                    title={currentUserData?.phoneNumber}
                    size={80}
                />

                <Text style={styles.heading}>{storedContacts[currentUserData?.phoneNumber ?? ""]?.displayName ?? currentUserData?.displayName ?? currentUserData?.phoneNumber ?? "Unknown"}</Text>

                {
                    currentUserData?.about && (
                        <Text
                            numberOfLines={2}
                            style={styles.about}
                        >
                            {currentUserData?.about}
                        </Text>
                    )
                }
            </View>

            {
                commonChats.length > 0 && (
                    <>
                        <Text style={styles.heading}>{commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"} in common</Text>
                        {
                            commonChats.map(userChat => {
                                const currChat = userChat.chat;

                                return (
                                    <DataItem 
                                        key={currChat.id}
                                        title={currChat?.chatName ?? currChat?.memberPhoneNumbers.join(", ")}
                                        subTitle={currChat?.latestMessage ?? ""}
                                        type="link"
                                        onPress={() => props.navigation.push("ChatScreen", { chatId: currChat.id, isGroupChat: true })}
                                        image={currChat?.chatImageUrl}
                                    />
                                );
                            })
                        }
                    </>
                )
            }

            {
                chatData && chatData.chatType === "GROUPCHAT" && (
                    isLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <SubmitButton 
                            title="Remove from chat"
                            color={colors.red}
                            style={{ marginTop: "auto", marginBottom: 20 }}
                            onPress={removeFromChat}
                        />
                    )
                )
            }
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    topContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
    },
    about: {
        fontFamily: "medium",
        fontSize: 16,
        letterSpacing: 0.3,
        color: colors.grey,
    },
    heading: {
        fontFamily: "bold",
        fontSize: 16,
        letterSpacing: 0.3,
        color: colors.textColor,
        marginVertical: 8,
    },
    text: {
        fontSize: 28,
        color: colors.textColor,
        fontFamily: "bold",
        letterSpacing: 0.3,
    }
});

export default ContactScreen;