import React, { useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
import { ActivityIndicator, ScrollView, StyleSheet, View, Text, TextInput } from "react-native";
import DataItem from "../components/DataItem";
import SubmitButton from "../components/SubmitButton";
import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import ProfileImage from "../components/ProfileImage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Input from "../components/Input";
import colors from "../constants/colors";
import { logout, updateLoggedInUserData } from "../stores/authSlice";
import { userLogout } from "../utils/actions/authActions";
import agent from "../api/agent";
import { UpdateUserRequest, User } from "../models/UserModels";

interface FormValues {
    displayName: string;
    about: string;
}

const SettingsScreen = (props: any) => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const initialValues: FormValues = {
        displayName: userData?.displayName ?? "",
        about: userData?.about ?? "",
    }

    useEffect(() => {
        console.log(userData);
    }, [userData]);
    
    return (
        <PageContainer style={styles.container}>

            <ScrollView contentContainerStyle={styles.formContainer}>
                <ProfileImage size={80} title={userData?.phoneNumber} uri={userData?.profilePictureUrl ?? ""} showEditButton={true} userId={userData?.phoneNumber} />
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values, { setErrors }) => {
                        (
                            async () => {
                                try {
                                    const newUser: UpdateUserRequest = {
                                        phoneNumber: userData?.phoneNumber ?? "",
                                        profilePictureUrl: userData?.profilePictureUrl ?? null,
                                        displayName: values.displayName,
                                        about: values.about.trim() === "" ? null : values.about,
                                    }

                                    const user = await agent.Account.updateUser(newUser);

                                    dispatch(updateLoggedInUserData({ newData: user as User }));
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        )();
                    }}
                    validationSchema={Yup.object({
                        displayName: Yup.string().required("Display name is required"),
                        about: Yup.string(),
                    })}
                >
                    {({ handleSubmit, isSubmitting, errors, isValid, dirty, handleChange, handleBlur, touched, values }) => (
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="user-o" size={24} style={styles.icon} />
                                <TextInput 
                                    placeholder="Display name"
                                    style={styles.input}
                                    onChangeText={text => handleChange("displayName")(text)}
                                    onBlur={handleBlur("displayName")}
                                    value={values.displayName}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <MaterialIcons name="description" size={24} style={styles.icon} />
                                <TextInput 
                                    placeholder="About"
                                    style={styles.input}
                                    onChangeText={text => handleChange("about")(text)}
                                    onBlur={handleBlur("about")}
                                    value={values.about}
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
            
                            {/* <DataItem 
                                type="link"
                                title="Starred messages"
                                hideImage={true}
                                onPress={() => props.navigation.navigate("DataList", { title: "Starred messages", data: sortedStarredMessages, type: "messages" })}
                            /> */}
            
                            <SubmitButton title="Logout" onPress={ () => {
                                // @ts-ignore
                                dispatch(userLogout(userData))
                            } } style={{ marginTop: 20 }} color={colors.red} />
                        </View>
                    )}
                </Formik>
            </ScrollView>

            
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        alignItems: 'center',
        width: "100%",
        gap: 20,
        paddingTop: 10,
    },
    label: {
        marginVertical: 8,
        fontFamily: "bold",
        letterSpacing: 0.3,
        color: colors.textColor,
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
    errorContainer: {
        marginVertical: 5,
    },
    errorText: {
        color: colors.error,
        fontFamily: "regular",
        fontSize: 13,
        letterSpacing: 0.3,
    },
})

export default SettingsScreen;