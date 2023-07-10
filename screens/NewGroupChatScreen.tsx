import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Text, StyleSheet, View, TextInput, FlatList, ActivityIndicator } from "react-native";
import PageContainer from "../components/PageContainer";
import { RootState } from "../stores/store";
import colors from "../constants/colors";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import ProfileImage from "../components/ProfileImage";
import { FontAwesome } from "@expo/vector-icons";
import commonStyles from "../constants/commonStyles";
import DataItem from "../components/DataItem";
import { User } from "../models/UserModels";
import { CreateChatRequest } from "../models/Chat";
import agent from "../api/agent";
import { getUserChats } from "../utils/actions/chatActions";

const NewGroupChatScreen = (props: any) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [noResultsFound, setNoResultsFound] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [chatName, setChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const userData = useSelector((state: RootState) => state.auth.userData);
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);

    const [users, setUsers] = useState<User[]>(Object.values(storedContacts).filter(contact => contact.phoneNumber !== userData?.phoneNumber));

    const selectedUsersFlatList = useRef<FlatList>();

    const chatId = props.route.params && props.route.params.chatId;
    const existingUsers = props.route.params && props.route.params.existingUsers;
    const isGroupChat = props.route.params && props.route.params.isGroupChat;
    const isNewChat = !chatId;
    const isGroupChatDisabled = (isNewChat && chatName === "") || selectedUsers.length === 0;

    useEffect(() => {
        props.navigation.setOptions({
            headerLeft: () => {
                return (
                    <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                        <Item 
                            title="Close"
                            onPress={() => props.navigation.goBack()}
                        />
                    </HeaderButtons>
                );
            },
            headerRight: () => {
                return (
                    <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                        {
                            <Item
                                title={isNewChat ? "Create" : "Add"}
                                disabled={isGroupChatDisabled}
                                color={isGroupChatDisabled ? colors.lightGrey : colors.blue}
                                onPress={() => {
                                    const screenName = isNewChat ? "ChatList" : "ChatSettings";
                                    props.navigation.navigate(screenName, {
                                        selectedUsers,
                                        chatName,
                                        chatId
                                    });
                                }}
                            />
                        }
                    </HeaderButtons>
                );
            },
            headerTitle: "Add Participants",
        });
    }, [chatName, selectedUsers]);

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

    const userPressed = (user: User) => {
        const newSelectedUsers = selectedUsers.includes(user) ? 
            selectedUsers.filter(selectedUser => selectedUser.phoneNumber !== user.phoneNumber) : 
            [...selectedUsers, user];
        console.log(newSelectedUsers);
        setSelectedUsers(newSelectedUsers);
    }

    return (
        <PageContainer>
            {
                <View style={styles.chatNameContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.textBox}
                            placeholder="Enter a name for your chat"
                            autoCorrect={false}
                            autoComplete='off'
                            onChangeText={(text) => setChatName(text)}
                        />
                    </View>
                </View>
            }

            <View style={{ ...styles.selectedUsersContainer, height: (selectedUsers.length > 0) ? 80 : 0 }}>
                <FlatList 
                    style={styles.selectedUsersList}
                    data={selectedUsers}
                    horizontal={true}
                    keyExtractor={item => item.phoneNumber}
                    contentContainerStyle={{ alignItems: "center" }}
                    ref={ref => {
                        // @ts-ignore
                        selectedUsersFlatList.current = ref;
                    }}
                    onContentSizeChange={() => selectedUsers.length > 0 && selectedUsersFlatList.current?.scrollToEnd()}
                    renderItem={itemData => {
                        const user = itemData.item;
                        return (
                            <View style={styles.selectedUserContainer}>
                                <ProfileImage
                                    size={40}
                                    uri={user.profilePictureUrl} 
                                    onPress={() => userPressed(user)}
                                    title={user.phoneNumber}
                                    showRemoveButton={true}
                                />
                                <Text style={{
                                    textAlign: "center",
                                }}>
                                    {storedContacts[user.phoneNumber].displayName ?? user.displayName ?? user.phoneNumber}
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>

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
                            Searching...
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
                            onPress={() => userPressed(user)}
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
    selectedUserContainer: {
        alignItems: "center",
        marginHorizontal: 10,
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
})

export default NewGroupChatScreen;