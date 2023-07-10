import React, { useRef } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, TextInput } from "react-native";
import PageContainer from "../components/PageContainer";
import colors from "../constants/colors";
import { ErrorMessage, Form, Formik } from "formik";
const logo = require("../assets/images/logo.png");
import * as Yup from "yup";
import Input from "../components/Input";
import { FontAwesome } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import agent from "../api/agent";
import { OTPRequest } from "../models/AuthInterfaces";
import { UpdateUserRequest, User } from "../models/UserModels";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { updateLoggedInUserData } from "../stores/authSlice";
import SubmitButton from "../components/SubmitButton";

interface FormValues {
    displayName: string;
    about: string;
}

const CreateAccountScreen = (props: any) => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);

    const initialValues: FormValues = {
        displayName: "",
        about: "",
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <PageContainer>
                <ScrollView>
                    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={ Platform.OS === 'ios' ? "height" : undefined } keyboardVerticalOffset={100}>

                        <View style={styles.imageContainer}>
                            <Image source={logo} style={styles.image} />
                        </View>

                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>
                                Your display name determines how other people see you on the app. You can always change it later.
                            </Text>
                        </View>

                        <Formik
                            initialValues={{ 
                                displayName: "", 
                                about: "",
                            }}
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
                                <View style={styles.container}>
                                    <View style={styles.inputErrorWrapper}>
                                        <Text style={styles.label}>{"Display name: "}</Text>
                                            <TextInput 
                                                style={styles.input}
                                                placeholder="Display name"
                                                placeholderTextColor={colors.grey}
                                                autoFocus
                                                onChangeText={displayName => handleChange("displayName")(displayName)}
                                                defaultValue={values.displayName}
                                            />

                                        {
                                            errors.displayName && touched.displayName && (
                                                <View style={styles.errorContainer}>
                                                    <Text style={styles.errorText}>{errors.displayName}</Text>
                                                </View>
                                            )
                                        }
                                    </View>

                                    <View style={styles.inputErrorWrapper}>
                                        <Text style={styles.label}>{"About: "}</Text>
                                            <TextInput 
                                                style={styles.input}
                                                placeholder="Write something about yourself..."
                                                placeholderTextColor={colors.grey}
                                                onChangeText={about => handleChange("about")(about)}
                                                defaultValue={values.about}
                                            />

                                        {
                                            errors.about && touched.about && (
                                                <View style={styles.errorContainer}>
                                                    <Text style={styles.errorText}>{errors.about}</Text>
                                                </View>
                                            )
                                        }
                                    </View>

                                    {
                                        isSubmitting ? (
                                            <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.lightBlueGreen} />
                                        ) : (
                                            <SubmitButton 
                                                onPress={handleSubmit}
                                                disabled={!isValid || !dirty}
                                                text="Create account"
                                            />
                                        )
                                    }
                                </View>
                            )}
                        </Formik>
                    </KeyboardAvoidingView>
                </ScrollView>
            </PageContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    descriptionContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 15,
    },
    descriptionText: {
        color: colors.textColor,
        fontFamily: "medium",
        letterSpacing: 0.3,
        textAlign: "center",
        fontSize: 15,
    },
    inputErrorWrapper: {
        marginBottom: 20,
        height: 85
    },
    linkContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 15,
    },
    link: {
        color: colors.blue,
        fontFamily: "medium",
        letterSpacing: 0.3,
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "50%",
        resizeMode: "contain",
        height: 150,
        margin: 40
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: "center",
    },
    container: {
        width: "100%",
    },
    label: {
        marginVertical: 8,
        fontFamily: "bold",
        letterSpacing: 0.3,
        color: colors.textColor,
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
        width: "100%",
        flexDirection: "row",
        backgroundColor: colors.nearlyWhite,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 5,
        alignItems: "center",
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
    button: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    }
})

export default CreateAccountScreen;