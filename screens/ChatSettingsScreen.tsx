import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View, Text } from "react-native";
import PageContainer from "../components/PageContainer";
import colors from "../constants/colors";
import { useDispatch, useSelector } from "react-redux";
import ProfileImage from "../components/ProfileImage";
import { RootState } from "../stores/store";
import { Formik } from "formik";
import * as Yup from "yup";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import { useCallback, useState } from "react";
import { removeUserFromChat } from "../utils/actions/chatActions";
import DataItem from "../components/DataItem";

interface FormValues {
    chatName: string;
    chatDescription: string;
}

const ChatSettingsScreen = (props: any) => {
    const dispatch = useDispatch();
    const chatId = props.route?.params?.chatId;
    const chatData = useSelector((state: RootState) => state.chats.chatsData[chatId] ?? {});
    const userData = useSelector((state: RootState) => state.auth.userData);
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);
    const [isLoading, setIsLoading] = useState(false);
    const storedContacts = useSelector((state: RootState) => state.contacts.storedContacts);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const initialValues: FormValues = {
        chatName: chatData?.chatName ?? "",
        chatDescription: chatData?.chatDescription ?? "",
    }

    const leaveChat = useCallback(async () => {
        try {
            setIsLoading(true);

            await removeUserFromChat(userData, chatId, userData);

            props.navigation.popToTop();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, props.navigation]);

    if (!chatData.memberPhoneNumbers) return null;

    return (
        <PageContainer>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <ProfileImage 
                    size={80} 
                    title={userData?.phoneNumber} 
                    uri={chatData?.chatImageUrl} 
                    showEditButton={true} 
                    userId={userData?.phoneNumber} 
                    chatId={chatId} 
                    style={{ marginVertical: 20 }}
                />
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                    validationSchema={Yup.object({
                        chatName: Yup.string().required("Chat name is required"),
                        chatDescription: Yup.string(),
                    })}
                >
                    {({ handleSubmit, isSubmitting, errors, isValid, dirty, handleChange, handleBlur, touched, values }) => (
                        <View style={styles.scrollView}>
                            <Text style={styles.label}>Chat name:</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="group" size={24} style={styles.icon} />
                                <TextInput 
                                    placeholder="Chat name"
                                    style={styles.input}
                                    onChangeText={text => handleChange("chatName")(text)}
                                    onBlur={handleBlur("chatName")}
                                    value={values.chatName}
                                />
                            </View>

                            <Text style={styles.label}>Chat description:</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="description" size={24} style={styles.icon} />
                                <TextInput 
                                    placeholder="What is this chat about?"
                                    style={styles.input}
                                    onChangeText={text => handleChange("chatDescription")(text)}
                                    onBlur={handleBlur("chatDescription")}
                                    value={values.chatDescription}
                                />
                            </View>
            
                            <View style={{ marginTop: 20, width: "100%" }}>
                                {
                                    showSuccessMessage && (
                                        <Text style={{ color: colors.textColor, marginTop: 10 }}>Saved!</Text>
                                    )
                                }
            
                                {
                                    isSubmitting ? (
                                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 10 }} />
                                    ) : (
                                        dirty && <SubmitButton title="Save" onPress={handleSubmit} style={{ marginTop: 20 }} disabled={!isValid} />
                                    )
                                }
                            </View>
                        </View>
                    )}
                </Formik>

                <View style={styles.sectionContainer}>
                    <Text style={styles.heading}>
                        {chatData.memberPhoneNumbers.length} {chatData.memberPhoneNumbers.length === 1 ? "Member" : "Members"}
                    </Text>

                    <DataItem 
                        title="Add members"
                        icon="plus"
                        onPress={() => {}}
                    />

                    {
                        chatData.memberPhoneNumbers.slice(0, 4).map((phoneNumber: string) => {
                            const user = storedUsers[phoneNumber];

                            return (
                                <DataItem 
                                    key={phoneNumber}
                                    image={user?.profilePictureUrl}
                                    title={storedContacts[phoneNumber]?.displayName ?? user.displayName ?? phoneNumber}
                                    subTitle={user?.about ?? "Hey there! I am using Ping!"}
                                    onPress={() => phoneNumber !== userData?.phoneNumber && props.navigation.navigate("Contact", { uid: phoneNumber, chatId })}
                                />
                            )
                        })
                    }

                    {
                        chatData.memberPhoneNumbers.length > 4 && (
                            <DataItem 
                                type="link"
                                title="See all members"
                                hideImage={true}
                                onPress={() => {}}
                            />
                        )
                    }
                </View>
            </ScrollView>

            {
                <SubmitButton 
                    title="Leave chat"
                    color={colors.red}
                    onPress={leaveChat}
                    style={{ marginVertical: 20 }}
                />
            }
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: "center",
        textAlign: "center",
    },
    scrollView: {
        justifyContent: 'center',
        alignItems: "center",
    },
    sectionContainer: {
        width: "100%",
        marginTop: 10
    },
    heading: {
        marginVertical: 8,
        color: colors.textColor,
        fontFamily: "bold",
        letterSpacing: 0.3,
    },
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: colors.nearlyWhite,
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginVertical: 5,
        borderRadius: 2,
        alignItems: "center",
    },
    icon: {
        marginRight: 10,
        color: colors.grey,
    },
    input: {
        color: colors.textColor,
        flex: 1,
        fontFamily: "regular",
        letterSpacing: 0.3,
        paddingTop: 0,
    },
    label: {
        width: "100%",
        marginRight: "auto",
        color: colors.textColor,
        fontFamily: "bold",
        letterSpacing: 0.3,
        marginTop: 10,
    }
})

export default ChatSettingsScreen;

