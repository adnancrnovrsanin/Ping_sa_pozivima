import { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View, Image, StyleSheet } from "react-native"
import { useDispatch, useSelector } from "react-redux";
import colors from "../constants/colors";
import { stringToColour } from "../utils/usefulFunctions";
import { FontAwesome } from "@expo/vector-icons";
import { launchImagePicker, uploadImageAsync } from "../utils/imagePickerHelper";
import { UpdateUserRequest, User } from "../models/UserModels";
import { RootState } from "../stores/store";
import agent from "../api/agent";
import { updateLoggedInUserData } from "../stores/authSlice";
import { UpdateChatRequest } from "../models/Chat";
import { updateChatImageUrl } from "../stores/chatsSlice";

const ProfileImage = (props: any) => {
    const dispatch = useDispatch();

    const source = props.uri ? { uri: props.uri } : null;

    const [image, setImage] = useState(source);
    const [isLoading, setIsLoading] = useState(false);
    const userData = useSelector((state: RootState) => state.auth.userData);

    const showEditButton = props.showEditButton && props.showEditButton === true;
    const showRemoveButton = props.showRemoveButton && props.showRemoveButton === true;
    const title = props.title ? props.title : null;

    const chatId = props.chatId ?? null;
    const userId = props.userId ?? null;

    const pickImage = async () => {
        try {
            const tempUri = await launchImagePicker();

            if (!tempUri) return;

            setIsLoading(true);
            const uploadUrl = await uploadImageAsync(tempUri, chatId !== null);
            setIsLoading(false);

            if (!uploadUrl) throw new Error("Error uploading image");

            if (chatId !== null) {
                const newChat: UpdateChatRequest = {
                    id: chatId,
                    chatName: null,
                    chatImageUrl: uploadUrl,
                    chatDescription: null,
                    chatType: "GROUPCHAT",
                    memberPhoneNumbers: null,
                    createdAt: null,
                    updatedAt: null,
                    latestMessage: null,
                };
                await agent.ChatRequests.updateChatRequest(newChat);

                dispatch(updateChatImageUrl({ id: chatId, newImageUrl: uploadUrl }));
            } else if (userId !== null) {
                const newUser: UpdateUserRequest = {
                    phoneNumber: userData?.phoneNumber ?? "",
                    profilePictureUrl: uploadUrl,
                    displayName: userData?.displayName ?? null,
                    about: userData?.about ?? null,
                }

                const user = await agent.Account.updateUser(newUser);

                if (!user) throw new Error("Error updating user");

                dispatch(updateLoggedInUserData({ newData: user as User }));
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    const Container = (props.onPress || showEditButton) ? TouchableOpacity : View;

    return (
        // @ts-ignore
        <Container
            style={{ ...props.style, ...styles.image, width: props.size, height: props.size, backgroundColor: title !== null ? stringToColour(title) : `#${Math.floor(Math.random()*16777215).toString(16)}`}}
            onPress={props.onPress || pickImage}
        >
            {
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : (
                    image && (
                        <Image 
                            style={{
                                ...styles.image,
                                ...{
                                    width: props.size,
                                    height: props.size,
                                }
                            }}
                            source={image}
                        />
                    )
                )
            }

            {
                showEditButton && !isLoading && (
                    <View style={styles.editIconContainer}>
                        <FontAwesome name="pencil" size={15} color="black" />
                    </View>
                )
            }

            {
                showRemoveButton && !isLoading && (
                    <View style={styles.removeIconContainer}>
                        <FontAwesome name="close" size={8} color="black" />
                    </View>
                )
            }
        </Container>
    );
}

const styles = StyleSheet.create({
    image: {
        borderRadius: 50,
        borderColor: colors.grey,
        borderWidth: 1,
    },
    editIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.lightGrey,
        borderRadius: 20,
        padding: 8,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    removeIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.lightGrey,
        borderRadius: 20,
        padding: 3,
    }
});

export default ProfileImage;