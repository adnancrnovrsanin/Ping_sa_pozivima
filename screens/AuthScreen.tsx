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

const AuthScreen = (props: any) => {

    const phoneInput = useRef<PhoneInput>(null);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <PageContainer>
                <ScrollView>
                    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={ Platform.OS === 'ios' ? "height" : undefined } keyboardVerticalOffset={100}>

                        <View style={styles.imageContainer}>
                            <Image source={logo} style={styles.image} />
                        </View>

                        <Formik
                            initialValues={{ phoneNumber: "", error: null }}
                            onSubmit={(values, { setSubmitting }) => {
                                const request: OTPRequest = {
                                    phoneNumber: values.phoneNumber,
                                };
                                // console.log("request: ", request);
                                // console.log(values);
                                
                                agent.Account.generateOTP(request)
                                    .then(() => {
                                        props.navigation.navigate("Otp", { phoneNumber: values.phoneNumber });
                                        setSubmitting(false);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            }}
                            validationSchema={Yup.object({
                                phoneNumber: Yup.string().required("Phone number is required"),
                            })}
                        >
                            {({ handleSubmit, isSubmitting, errors, isValid, dirty, handleChange, handleBlur, touched, values }) => (
                                <View style={styles.container}>
                                    <View>
                                        <Text style={styles.label}>{"Phone number: "}</Text>
                                            <PhoneInput 
                                                ref={phoneInput}
                                                defaultValue={values.phoneNumber}
                                                defaultCode="RS"
                                                layout="first"
                                                onChangeFormattedText={text => handleChange("phoneNumber")(text)}
                                                autoFocus
                                                containerStyle={styles.inputContainer}
                                                textInputStyle={styles.input}
                                            />

                                        {
                                            errors.phoneNumber && touched.phoneNumber && (
                                                <View style={styles.errorContainer}>
                                                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                                                </View>
                                            )
                                        }
                                    </View>

                                    <ErrorMessage name="error" render={() => <label style={{ marginBottom: 10 }} color="red">{errors.error}</label>}/>

                                    {
                                        isSubmitting ? (
                                            <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.lightBlueGreen} />
                                        ) : (
                                            <TouchableOpacity 
                                                style={{
                                                    ...styles.button,
                                                    backgroundColor: (!isValid || !dirty || isSubmitting) ? colors.lightGrey : colors.primary,
                                                }}
                                                disabled={!isValid || !dirty || isSubmitting}
                                                onPress={() => {
                                                    handleSubmit();
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: (!isValid || !dirty || isSubmitting) ? colors.grey : "white",
                                                        fontFamily: "bold",
                                                        letterSpacing: 0.3,
                                                    }}
                                                >
                                                    Submit
                                                </Text>
                                            </TouchableOpacity>
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
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: colors.nearlyWhite,
        paddingHorizontal: 10,
        borderRadius: 5,
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

export default AuthScreen;