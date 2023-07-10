import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Button, Text, View, TouchableOpacity, Image, ActivityIndicator } from "react-native";

// import { checkVerification } from "../api/verify";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import colors from "../constants/colors";
import agent from "../api/agent";
import { AuthRequest, OTPRequest } from "../models/AuthInterfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { authenticate } from "../stores/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
const logo = require("../assets/images/logo.png");

const OtpScreen = (props: any) => {
  const dispatch = useDispatch();
 const phoneNumber = props.route?.params?.phoneNumber || "";
 const [invalidCode, setInvalidCode] = useState(false);
 const [loading, setLoading] = useState(false);

 return (
   <SafeAreaView style={styles.wrapper}>
      <Image source={logo} style={styles.image} />

     <Text style={styles.prompt}>Enter the code we sent you</Text>
     <Text style={styles.message}>
       {`Your phone (${phoneNumber}) will be used to protect your account each time you log in.`}
     </Text>

     <OTPInputView
       style={{ width: "80%", height: 200 }}
       pinCount={6}
       autoFocusOnLoad
       codeInputFieldStyle={styles.underlineStyleBase}
       codeInputHighlightStyle={styles.underlineStyleHighLighted}
       onCodeFilled={(code) => {
        setLoading(true);
        const request: AuthRequest = {
          phoneNumber: phoneNumber,
          otp: code,
        }
        
        agent.Account.authenticate(request)
          .then((response) => {
            if (response) {
              console.log("response: ", response);
                
              AsyncStorage.setItem("userData", JSON.stringify({
                token: response.token,
                userPhoneNumber: response.user.phoneNumber,
                expiryDate: response.tokenExpiration,
              }));
              dispatch(authenticate(response));
            } else {
              setInvalidCode(true);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.log("error: ", error);
          });
       }}
     />
     {invalidCode && <Text style={styles.error}>Incorrect code.</Text>}

     {
        loading && <ActivityIndicator size="large" color={colors.primary} />
     }

     <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            const request: OTPRequest = {
              phoneNumber: phoneNumber,
            };
            
            agent.Account.generateOTP(request);
          }}
        >
            <Text style={styles.optionText}>Resend the code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => props.navigation.goBack()}
        >
            <Text style={styles.optionText}>Edit phone number</Text>
        </TouchableOpacity>
     </View>
   </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 wrapper: {
   flex: 1,
   justifyContent: "center",
    alignItems: "center",
 },

 borderStyleBase: {
   width: 30,
   height: 45,
 },

 borderStyleHighLighted: {
   borderColor: "#03DAC6",
 },

 underlineStyleBase: {
   width: 30,
   height: 45,
   borderWidth: 0,
   borderBottomWidth: 1,
   color: "black",
   fontSize: 20,
 },

 underlineStyleHighLighted: {
   borderColor: "#03DAC6",
 },

 prompt: {
   fontSize: 24,
   paddingHorizontal: 30,
   paddingBottom: 20,
 },

 message: {
   fontSize: 16,
   paddingHorizontal: 30,
 },

 error: {
   color: "red",
 },
 optionsContainer: {
    width: "100%",
    alignItems: "center",
 },
 optionButton: {
    width: 300,
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.lightBlueGreen,
    alignItems: "center",
 },
  optionText: {
    color: "white",
    fontSize: 16,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  image: {
    width: "50%",
    resizeMode: "contain",
    height: 150,
    margin: 40
  },
});

export default OtpScreen;