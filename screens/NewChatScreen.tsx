import { useEffect, useState } from "react";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { User } from "../models/UserModels";
import PageContainer from "../components/PageContainer";
import colors from "../constants/colors";
import { ActivityIndicator, StyleSheet, TextInput, View, Text, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import commonStyles from "../constants/commonStyles";
import DataItem from "../components/DataItem";
import { CreateChatRequest } from "../models/Chat";
import agent from "../api/agent";
import { addChatsData } from "../stores/chatsSlice";
import { getUserChats } from "../utils/actions/chatActions";

const NewChatScreen = (props: any) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [noResultsFound, setNoResultsFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pickedUser, setPickedUser] = useState<Boolean>(false);
    
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [users, setUsers] = useState<User[]>(Object.values(storedContacts).filter(contact => contact.phoneNumber !== userData?.phoneNumber));
    const userChats = useSelector((state: RootState) => state.chats.userChatsData);

    useEffect(() => {
        props.navigation.setOptions({
            headerTitle: "Send Message",
            headerLeft: () => {
                return (
                    <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                        <Item 
                            title="Close"
                            onPress={() => props.navigation.goBack()}
                        />
                    </HeaderButtons>
                );
            }
        });
    },[]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (!searchTerm || searchTerm === "") {
                setUsers(Object.values(storedContacts).filter(contact => contact.phoneNumber !== userData?.phoneNumber));
                setNoResultsFound(false);
                return;
            }
            
            setIsLoading(true);

            const storedContactsArray = Object.values(storedContacts);
            const filteredUsers = storedContactsArray.filter((contact) => {
                const contactName = contact.displayName?.toLowerCase();
                const contactPhoneNumber = contact.phoneNumber;

                return (
                    contactPhoneNumber !== userData?.phoneNumber &&
                    (
                        contactName?.includes(searchTerm.toLowerCase()) ||
                        contactPhoneNumber.includes(searchTerm.toLowerCase())
                    )
                );
            });
            setUsers(...[filteredUsers]);

            setIsLoading(false);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    return (
        <PageContainer>
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={15} color={colors.lightGrey} />

                <TextInput 
                    placeholder="Search"
                    style={styles.searchBox}
                    onChangeText={(text) => setSearchTerm(text)}
                />
            </View>

            {
                isLoading && (
                    <View style={commonStyles.center}>
                        <ActivityIndicator size="large" color={colors.blue} />

                        <Text style={styles.noResultsText}>
                            Loading...
                        </Text>
                    </View>
                )
            }

            {
                !isLoading && !noResultsFound && users && 
                <FlatList 
                    data={users}
                    renderItem={(itemData) => {
                        const user = itemData.item;

                        return <DataItem 
                            title={user.displayName}
                            subTitle={user.about}
                            image={user.profilePictureUrl}
                            onPress={!pickedUser ? async () => {
                                setPickedUser(true);
                                try {
                                    const newChat: CreateChatRequest = {
                                        chatName: "",
                                        chatImageUrl: "",
                                        memberPhoneNumbers: [user.phoneNumber],
                                        chatDescription: "",
                                        chatType: "PRIVATECHAT",
                                        creatorPhoneNumber: userData?.phoneNumber ?? "",
                                    }

                                    const currentChat = Object.values(userChats).find(chat => chat.chat.chatType === "PRIVATECHAT" && chat.chat.memberPhoneNumbers.includes(user.phoneNumber));

                                    if (currentChat) {
                                        props.navigation.replace("ChatScreen", { chatId: currentChat.chat.id, isGroupChat: false });
                                    } else {
                                        setIsLoading(true);
                                        const createdChat = await agent.ChatRequests.createChatRequest(newChat);
                                        await getUserChats(userData?.phoneNumber ?? "");
                                        setIsLoading(false);
                                        props.navigation.replace("ChatScreen", { chatId: createdChat.id, isGroupChat: false });
                                    };
                                } catch (error) {
                                    console.log(error);
                                } finally {
                                    setPickedUser(false);
                                }
                            } : null}
                        />;
                    }}
                />
            }

            {
                !isLoading && noResultsFound && (
                    <View style={commonStyles.center}>
                        <FontAwesome name="question" size={55} color={colors.lightGrey} style={styles.noResultsIcon} />

                        <Text style={styles.noResultsText}>
                            No users found!
                        </Text>
                    </View>
                )
            }

            {
                !isLoading && !users && (
                    <View style={commonStyles.center}>
                        <FontAwesome name="users" size={55} color={colors.lightGrey} style={styles.noResultsIcon} />

                        <Text style={styles.noResultsText}>
                            Enter a name to search for a user!
                        </Text>
                    </View>
                )
            }
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.extraLightGrey,
        height: 30,
        marginVertical: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 5,
    },
    searchBox: {
        marginLeft: 8,
        fontSize: 15,
        width: "100%"
    },
    noResultsIcon: {
        marginBottom: 20,
    },
    noResultsText: {
        color: colors.textColor,
        fontFamily: "regular",
        letterSpacing: 0.3
    },
    chatNameContainer: {
        paddingVertical: 10,
    },
    inputContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: colors.nearlyWhite,
        flexDirection: "row",
        borderRadius: 2
    },
    textBox: {
        color: colors.textColor,
        width: "100%",
        fontFamily: "regular",
        letterSpacing: 0.3
    },
    selectedUsersContainer: {
        justifyContent: "center",
    },
    selectedUsersList: {
        height: "100%",
        paddingTop: 10,
    },
    selectedUserStyle: {
        marginRight: 10,
        marginBottom: 10,
    }
})

export default NewChatScreen;