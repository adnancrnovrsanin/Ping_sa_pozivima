import { StyleSheet, View } from "react-native";
import Button from "./Button";
import { RTCView, MediaStream } from "react-native-webrtc";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";

interface Props {
    hangup: () => void;
}

function ButtonContainer(props: Props) {
    return (
        <View style={styles.bContainer}>
            <Button backgroundColor="red" iconName="phone" onPress={props.hangup} />
        </View>
    );
}

const Video = (props: Props) => {
    const localStreamUrl = useSelector((state: RootState) => state.webRtc.localStreamUrl);
    const remoteStreamUrl = useSelector((state: RootState) => state.webRtc.remoteStreamUrl);

    console.log("localStream", localStreamUrl);
    console.log("remoteStream", remoteStreamUrl);

    // Once the call is connected we will display 
    // local Stream on top of remote stream
    if (localStreamUrl && remoteStreamUrl) {
        return (
            <View style={styles.container}>
                <RTCView streamURL={remoteStreamUrl} objectFit={'cover'} style={styles.video} />
                <RTCView streamURL={localStreamUrl} objectFit={'cover'} style={styles.videoLocal} />
                <ButtonContainer hangup={props.hangup} />
            </View>
        );
    }

    // On call we will just display the local stream
    if (localStreamUrl && !remoteStreamUrl) {
        console.log("localStreamUrl inside: ", localStreamUrl);
        return (
            <View style={styles.container}>
                <RTCView
                    streamURL={localStreamUrl} 
                    objectFit={'cover'} 
                    style={styles.video}
                />
                <ButtonContainer hangup={props.hangup} />
            </View>
        );
    }
    
    return <ButtonContainer hangup={props.hangup} />;
};

const styles = StyleSheet.create({
    bContainer: {
        flexDirection: "row",
        bottom: 30
    },
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    video: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    videoLocal: {
        position: "absolute",
        width: 100,
        height: 150,
        top: 0,
        left: 20,
        elevation: 10,
    }
});

export default Video;