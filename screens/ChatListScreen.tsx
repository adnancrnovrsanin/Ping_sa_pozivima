import { StyleSheet, Text, TouchableNativeFeedback, View, FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import PageContainer from "../components/PageContainer";
import { useEffect, useRef, useState } from "react";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { Menu, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import CustomMenuItem from "../components/CustomMenuItem";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { RootState } from "../stores/store";
import { useDispatch, useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import colors from "../constants/colors";
import * as Contacts from "expo-contacts";
import { getUserDataByPhoneNumber } from "../utils/actions/userActions";
import { editStoredUser } from "../stores/userSlice";
import { getUserChats } from "../utils/actions/chatActions";
import { useIsFocused } from "@react-navigation/native";
import { CreateChatRequest } from "../models/Chat";
import agent from "../api/agent";

const ChatListScreen = (props: any) => {
    const selectedUsersList = props.route?.params?.selectedUsers;
    const chatName = props.route?.params?.chatName;

    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (
            async () => {
                if (userData && isFocused) {
                    setIsLoading(true);
                    await getUserChats(userData.phoneNumber);
                    setIsLoading(false);
                }
            }
        )();
    }, [props, isFocused]);

    const userChatsArray = useSelector((state: RootState) => {
        const chatsData = state.chats.userChatsData;
        // @ts-ignore
        if (chatsData) return Object.values(chatsData).sort((a, b) => new Date(b.chat?.updatedAt) - new Date(a.chat?.updatedAt));
        return [];
    });
    // const userChats = useSelector((state: RootState) => Object.values(state.chats.userChatsData));
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);

    const menuRef = useRef(null);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return (
                    <>
                        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                            <Item 
                                title="Options"
                                iconName="ellipsis-vertical"
                                color="white"
                                onPress={() => {
                                    if (menuRef?.current)
                                    // @ts-ignore
                                        menuRef.current.props.ctx.menuActions.openMenu("ChatListMenu");
                                }}
                            />
                        </HeaderButtons>

                        <Menu name="ChatListMenu" ref={menuRef}>
                            <MenuTrigger />

                            <MenuOptions>
                                <CustomMenuItem text="New group chat" iconPack={Entypo} icon="chat" onSelect={() => props.navigation.navigate("NewGroupChat")} />
                                <CustomMenuItem text="Settings" icon="settings" onSelect={() => props.navigation.navigate("Settings")} />
                            </MenuOptions>
                        </Menu>
                    </>
                );
            }
        });
    }, []);

    useEffect(() => {
        (
            async () => {
                if (!selectedUsersList) return;

                try {
                    const chatUsers = selectedUsersList;
                    if (!chatUsers.includes(userData)) chatUsers.push(userData);

                    const newChatData: CreateChatRequest = {
                        chatName: chatName,
                        chatType: "GROUPCHAT",
                        memberPhoneNumbers: chatUsers.map((user: any) => user.phoneNumber),
                        chatImageUrl: null,
                        chatDescription: null,
                        creatorPhoneNumber: userData?.phoneNumber ?? "",
                    }
                    setIsLoading(true);
                    const createdChat = await agent.ChatRequests.createChatRequest(newChatData);
                    await getUserChats(userData?.phoneNumber ?? "");
                    
                    props.navigation.navigate("ChatScreen", { chatId: createdChat.id, isGroupChat: true });
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            }
        )();
    }, [props.route?.params]);

    useEffect(() => {
        const storedUsersArray = Object.values(storedUsers);
        if (storedUsersArray.length > 0) {
            for (let i = 0; i < storedUsersArray.length; i++) {
                let user = storedUsersArray[i];
                user.displayName = storedContacts[user.phoneNumber]?.displayName ?? user.displayName;
                dispatch(editStoredUser({ user: user }));
            }
        }
    }, [storedContacts]);

    if (isLoading) {
        return (
            <PageContainer style={styles.container}>
                <ActivityIndicator size="large" style={{ marginTop: 20 }} color={colors.primary} />
            </PageContainer>
        );
    }

    return (
        <PageContainer style={styles.container}>
            {
                userChatsArray.length > 0 && (
                    <FlatList
                        data={userChatsArray.sort((a, b) => {
                            const aDate = new Date(a.chat?.updatedAt);
                            const bDate = new Date(b.chat?.updatedAt);
                            return bDate.getTime() - aDate.getTime();
                        })}
                        keyExtractor={(item, index) => index.toString()}
                        style={{
                            flex: 1,
                            // backgroundColor: "red"
                        }}
                        renderItem={(itemData) => {
                            const item = itemData.item;
                            const chatData = item.chat;
                            const chatId = chatData.id;
                            const isGroupChat = chatData.chatType === "GROUPCHAT";
                            
                            let title = "";
                            let image = "";
                            

                            if (isGroupChat) {
                                title = chatData.chatName || "";
                                image = chatData.chatImageUrl || "";
                            } else {
                                const otherUserPhoneNumber = chatData.memberPhoneNumbers.find((phoneNumber: string) => phoneNumber !== userData?.phoneNumber);
                                const otherUser = storedUsers[otherUserPhoneNumber!];

                                if (!otherUser) return null;

                                title = storedContacts[otherUser.phoneNumber]?.displayName ?? otherUser.displayName ?? otherUser.phoneNumber;
                                image = otherUser.profilePictureUrl || "";
                            }

                            return (
                                <DataItem 
                                    title={title}
                                    subTitle={chatData.latestMessage || "New chat"}
                                    image={image}
                                    onPress={() => { props.navigation.navigate("ChatScreen", { chatId, isGroupChat }) } }
                                />
                            );
                        }}
                    />
                )
            }
            {
                userChatsArray.length === 0 && (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text>You have no chats</Text>
                    </View>
                )
            }

            <TouchableOpacity style={styles.newMessageButton} onPress={() => props.navigation.navigate("NewChat")}>
                <MaterialIcons name="message" size={24} color="white" />
            </TouchableOpacity>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    newMessageButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center"
    }
})

export default ChatListScreen;