import { View, ActivityIndicator } from "react-native";
import commonStyles from "../constants/commonStyles";
import colors from "../constants/colors";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticate, setDidTryAutoLogin } from "../stores/authSlice";
import agent from "../api/agent";
import { AuthResponse } from "../models/AuthInterfaces";
import axios from "axios";

const StartUpScreen = (props: any) => {
    const dispatch = useDispatch();

    useEffect(() => {
        (
            async () => {
                const storedAuthInfo = await AsyncStorage.getItem("userData");

                if (!storedAuthInfo) {
                    dispatch(setDidTryAutoLogin());
                    return;
                }
                
                const { token, userPhoneNumber, expiryDate: expiryDateString } = JSON.parse(storedAuthInfo);

                console.log(token, userPhoneNumber, expiryDateString);
                

                const expiryDate = new Date(expiryDateString);

                if (expiryDate <= new Date() || !token || !userPhoneNumber) {
                    dispatch(setDidTryAutoLogin());
                    return;
                }

                try {
                    const response = await axios.get<AuthResponse>(`/user/${userPhoneNumber}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    
                    dispatch(authenticate({ token, user: response.data }));
                } catch (error) {
                    console.log(error);
                }
            }
        )();
    }, [dispatch]);

    return (
        <View style={commonStyles.center}>
            <ActivityIndicator size="large" color={colors.lightBlueGreen} />
        </View>
    ); 
};

export default StartUpScreen;

