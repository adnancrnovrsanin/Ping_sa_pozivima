import { Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { getFirebaseApp } from "./firebaseHelper";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import * as uuid from 'uuid';

export const launchImagePicker = async () => {
    await checkMediaPermissions();

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
}

export const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
        alert("Permission to access camera is required!");
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
}

export const shootVideo = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
        alert("Permission to access camera is required!");
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
}

const checkMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            return Promise.reject("Permission to access camera roll is required!");
        }
    }

    return Promise.resolve();
}

export const uploadImageAsync = async (uri: string, isChatImage = false, isVoice = false) => {
    const app = getFirebaseApp();

    const blob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            resolve(xhr.response);
        };

        xhr.onerror = function(e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
        }

        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send();
    });

    var pathFolder = "";

    if (!isVoice){
        pathFolder = isChatImage ? "chatImages" : "profileImages";
    } else {
        pathFolder = "voiceMessages";
    }

    const storageRef = ref(getStorage(app), `${pathFolder}/${uuid.v4()}`);

    await uploadBytesResumable(storageRef, blob);

    // We're done with the blob, close and release it
    // @ts-ignore
    blob.close();

    return await getDownloadURL(storageRef);
}