import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenCreationParams, User } from "../../models/UserModels";
import { clearChatsData, clearUserChatsData } from "../../stores/chatsSlice";
import { logout } from "../../stores/authSlice";
import { ref, getDatabase, set, child, update, get } from "firebase/database";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getFirebaseApp } from "../firebaseHelper";

export const userLogout = (userData: User | null) => {
    return async (dispatch: any) => {
        // try {
        //     await removePushToken(userData);
        // } catch (error) {
        //     console.log(error);
        // }

        await AsyncStorage.clear();
        dispatch(clearChatsData());
        dispatch(clearUserChatsData())
        dispatch(logout());
    }
}

const storePushToken = async (userData: TokenCreationParams) => {
    if (!Device.isDevice) return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    const tokenData = { ...userData.pushTokens } || {};
    const tokenArray = Object.values(tokenData);

    if (tokenArray.includes(token)) return;

    tokenArray.push(token);

    for (let i = 0; i < tokenArray.length; i++) {
        const tok = tokenArray[i];
        // @ts-ignore
        tokenData[i] = tok;
    }

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${userData.phoneNumber}/pushTokens`);
    
    await set(userRef, tokenData);
}