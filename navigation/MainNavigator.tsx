import { Platform, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import React, { createContext, useEffect, useRef, useState } from "react";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import CallsListScreen from "../screens/CallsListScreen";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../constants/colors";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import * as Contacts from "expo-contacts";
import { setStoredContacts } from "../stores/contactsSlice";
import { User } from "../models/UserModels";
import agent from "../api/agent";
import NewGroupChatScreen from "../screens/NewGroupChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChatSettingsScreen from "../screens/ChatSettingsScreen";
import ContactScreen from "../screens/ContactScreen";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { MediaStream, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { peerConstraints, sessionConstraints } from "../utils/webRTCUtils";
import { getStream } from "../utils/actions/userMediaActions";
import GettingCall from "../components/GettingCall";
import Video from "../components/Video";
import { setGettingCall, setLocalStreamUrl, setRemoteStreamUrl } from "../stores/webRtcSlice";
import InCallManager from "react-native-incall-manager";
import { Item } from "react-navigation-header-buttons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShadowVisible: false,
                headerBackground: (props: any) => {
                    return (
                        <LinearGradient
                            colors={[colors.pink, colors.primary]}
                            start={[0, 0]}
                            end={[1, 1]}
                            style={{ flex: 1 }}
                        />
                    );
                },
                headerTitleStyle: {
                    fontFamily: "bold",
                    fontSize: 24,
                    color: "white",
                },
                tabBarVisibilityAnimationConfig: {
                    show: {
                        animation: "timing",
                        config: {
                            duration: 300,
                            easing: () => 1,
                        }
                    }
                },
                tabBarActiveBackgroundColor: colors.pink,
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: colors.textColor,
                tabBarStyle: {
                    elevation: 0,
                    borderTopWidth: 0,
                    flexDirection: "row",
                },
            }}
        >
            <Tab.Screen name="ChatList" component={ChatListScreen} options={{
                tabBarShowLabel: false,
                headerTitle: "Ping",
                tabBarIcon: ({ color, size }) => <Entypo name="chat" size={size} color={color} />
            }} />
        </Tab.Navigator>
    );
}



const MainNavigator = (props: any) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(true);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const storedUsers = useSelector((state: RootState) => state.users.storedUsers);

    const [expoPushToken, setExpoPushToken] = useState('');
    console.log(expoPushToken);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token!));

        // @ts-ignore
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // Handle received notification
        });

        // @ts-ignore
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // const { data } = response.notification.request.content;
            // const chatId = data["chatId"];

            // if (chatId) {
            //     const pushAction = StackActions.push("ChatScreen", { chatId });
            //     navigation.dispatch(pushAction);
            // } else console.log("No chat found in notification data");
            console.log(response);
        });

        return () => {
            // @ts-ignore
            Notifications.removeNotificationSubscription(notificationListener.current);
            // @ts-ignore
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    // ----------------- Here starts WebRTC logic -----------------
    const gettingCall = useSelector((state: RootState) => state.webRtc.gettingCall);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const pc = useRef<RTCPeerConnection>();
    const connecting = useRef(false);
    const CallContext = createContext<() => Promise<void> | void>(() => {});

    useEffect(() => {
        const cRef = firestore().collection('meet').doc("chatId");

        const subscribe = cRef.onSnapshot(snapshot => {
            const data = snapshot.data();

            // On answer start the call
            if (pc.current && !pc.current.remoteDescription && data && data.answer) {
                pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }

            // If there is offer for chatId set the getting call flag
            if (data && data.offer && !connecting.current) {
                dispatch(setGettingCall(true));
                InCallManager.startRingtone('DEFAULT');
            }
        });

        // On Delete of collection call hangup
        // The other side has clicked on hangup
        const subscribeDelete = cRef.collection("callee").onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'removed') {
                    console.log("Treba da se pokrene");
                    await hangup();
                }
            });
        })

        return () => {
            subscribe();
            subscribeDelete();
        }
    }, []);

    const setupWebRTC = async () => {
        pc.current = new RTCPeerConnection(peerConstraints);

        // Get the audio and video stream for the call
        const stream = await getStream();
        if (stream) {
            dispatch(setLocalStreamUrl(stream.toURL()));
            setLocalStream(stream);
            stream.getTracks().forEach(
                track => pc.current?.addTrack(track, stream)
            );
        }

        // Get the remote stream once it is available
        if (pc.current) {
            pc.current.addEventListener( 'track', (event) => {
                // Grab the remote track from the connected participant.
                let remoteMediaStream = remoteStream || new MediaStream(undefined);
                // @ts-ignore
                remoteMediaStream.addTrack(event.track);
                dispatch(setRemoteStreamUrl(remoteMediaStream.toURL()));
                setRemoteStream(remoteMediaStream);
                InCallManager.stopRingtone();
                InCallManager.start({ 
                    media: 'audio',
                });
                InCallManager.setForceSpeakerphoneOn(true);
            } );
        }
    }

    const create = async () => {
        console.log("Calling");
        connecting.current = true;

        // setup webrtc
        await setupWebRTC();

        // Document the call
        const cRef = firestore().collection('meet').doc("chatId");

        // Exchange the ICE candidates between the caller and callee
        collectIceCandidates(cRef, 'caller', 'callee');

        if (pc.current) {
            // Create the offer for the call
            // Store the offer under the document
            try {
                const offer = await pc.current.createOffer(sessionConstraints);
                pc.current.setLocalDescription(offer);

                const cWithOffer = {
                    offer: {
                        type: offer.type,
                        sdp: offer.sdp
                    }
                };
        
                cRef.set(cWithOffer);
            } catch (error) {
                console.log(error);
            }
        }
    }
    const join = async () => {
        console.log("Joining the call");
        connecting.current = true;
        dispatch(setGettingCall(false));

        const cRef = firestore().collection('meet').doc("chatId");
        const offer = (await cRef.get()).data()?.offer;

        if (offer) {
            // Setup WebRTC
            await setupWebRTC();

            //Exchange the ICE candidates 
            // Check the parameters. Its reversed. Since the joining part is callee
            collectIceCandidates(cRef, 'callee', 'caller');

            if (pc.current) {
                try {
                    pc.current.setRemoteDescription(new RTCSessionDescription(offer));

                    // Create the answer for the call
                    // Update the document with answer
                    const answer = await pc.current.createAnswer();
                    pc.current.setLocalDescription(answer);

                    const cWithAnswer = {
                        answer: {
                            type: answer.type,
                            sdp: answer.sdp
                        },
                    };

                    cRef.update(cWithAnswer);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    // For disconnecting the call close the connection, release the stream
    // And delete the document for the call
    const hangup = async () => {
        console.log("Hanging up");
        InCallManager.stopRingtone();
        dispatch(setGettingCall(false)); 
        connecting.current = false;
        await firestoreCleanUp();
        await streamCleanUp();
        if (pc.current) {
            pc.current.close();
            InCallManager.stop();
        }
    };

    // Helper function
    const streamCleanUp = async () => {
        if (localStream) {
            localStream.getTracks().forEach(
                track => track.stop()
            );
            dispatch(setLocalStreamUrl(null));
            dispatch(setRemoteStreamUrl(null));
            setLocalStream(null);
            setRemoteStream(null);
        }
    };

    const firestoreCleanUp = async () => {
        const cRef = firestore().collection('meet').doc("chatId");

        if (cRef) {
            const calleeCandidate = await cRef.collection('callee').get();
            calleeCandidate.forEach(async (candidate) => {
                await candidate.ref.delete();
            });

            const callerCandidate = await cRef.collection('caller').get();
            callerCandidate.forEach(async (candidate) => {
                await candidate.ref.delete();
            });

            cRef.delete();
        }
    };

    const collectIceCandidates = async (
        cRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>,
        localName: string,
        remoteName: string
    ) => {
        const candidateCollection = cRef.collection(localName);

        if (pc.current) {
            // On new ICE candidate add it to firestore
            pc.current.addEventListener('icecandidate', (event) => {
                // @ts-ignore
                if (event.candidate) {
                    // @ts-ignore
                    candidateCollection.add(event.candidate.toJSON());
                }
            });
        }

        // Get the ICE candidate added to firestore and update the local PC
        cRef.collection(remoteName).onSnapshot(snapshot => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    if (pc.current) {
                        pc.current.addIceCandidate(candidate);
                    }
                }
            });
        });
    }
    

    // ------------- Here ends WebRTC logic -----------------

    useEffect(() => {
        (
            async () => {
                if (userData) {
                    setIsLoading(true);

                    

                    await Contacts.requestPermissionsAsync();
                    const { data } = await Contacts.getContactsAsync({
                        fields: [Contacts.Fields.PhoneNumbers],
                    });

                    let contacts: any = {};
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            const contact = data[i];
                            if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                                for (let j = 0; j < contact.phoneNumbers.length; j++) {
                                    const phoneNumber = contact.phoneNumbers[j];
                                    if (phoneNumber.number) {
                                        let number = phoneNumber.number.replaceAll(/[\s\-\(\)]/g, "");
                                        if (number?.startsWith("0")) number = "+381" + number.substring(1);

                                        if (!contacts[number]) contacts[number] = contact.name;
                                    }
                                }
                            }
                        }
                    }

                    try {
                        // console.log(Object.keys(contacts));
                        const result = await agent.Account.checkIfUsersExist(Object.keys(contacts));

                        result.map((user: User) => user.displayName = contacts[user.phoneNumber] ?? user.displayName);

                        if (result) dispatch(setStoredContacts({ newContacts: result }));
                    } catch (error) {
                        console.log(error);
                    }

                    setIsLoading(false);
                }
            }
        )();
    }, [userData]);

    const ChatScreenWrapper = (props: any) => {
        return (
            <CallContext.Consumer>
                {(create) => (
                    <ChatScreen {...props} create={create} />
                )}
            </CallContext.Consumer>
        );
    };
    
    const StackNavigator = (props: any) => {
        return (
            <Stack.Navigator>
                <Stack.Screen 
                    name="Home" 
                    component={TabNavigator}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen 
                    name="ChatScreen"
                    component={ChatScreenWrapper}
                    options={{
                        headerShadowVisible: false,
                        headerBackground: () => {
                            return (
                                <LinearGradient
                                    colors={[colors.pink, colors.primary]}
                                    start={[0, 0]}
                                    end={[1, 1]}
                                    style={{ flex: 1 }}
                                />
                            );
                        },
                        headerTitleStyle: {
                            fontFamily: "medium",
                            color: "white",
                            fontSize: 16
                        },
                        headerTintColor: "white",
                        gestureEnabled: true,
                    }}
                />
    
                <Stack.Screen 
                    name="Settings"
                    component={SettingsScreen}
                />
    
                <Stack.Screen 
                    name="ChatSettings"
                    component={ChatSettingsScreen}
                />
    
                <Stack.Screen 
                    name="Contact"
                    component={ContactScreen}
                />
    
                <Stack.Group screenOptions={{ presentation: "containedModal" }}>
                    <Stack.Screen 
                        name="NewGroupChat"
                        component={NewGroupChatScreen}
                    />
                    <Stack.Screen 
                        name="NewChat"
                        component={NewChatScreen}
                    />
                </Stack.Group>
            </Stack.Navigator>
        );
    }
    

    if (isLoading) return (
        <View style={ styles.container }>
            <Text style={ styles.label }>Loading contacts...</Text>
        </View>
    );

    // Displays getting call component
    if (gettingCall) {
        return <GettingCall hangup={hangup} join={join} />;
    }

    // Displays local stream on calling
    // Displays both local and remote stream once call is connected
    if (localStream) {
        return (
            <Video 
                hangup={hangup}
            />
        );
    }

    return (
        <CallContext.Provider value={create}>
            <StackNavigator />
        </CallContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: "center",
    },
    label: {
        fontSize: 18,
        fontFamily: "regular",
    }
});

export default MainNavigator;

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}