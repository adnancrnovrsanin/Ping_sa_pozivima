import { MediaStream, mediaDevices } from "react-native-webrtc";

export const getMediaDevices = async () => {
    let outputDevices: any = [];

    try {
        const devices: any = await mediaDevices.enumerateDevices();

        devices.forEach((device: any) => {
            if (device.kind === "videoinput") {
                outputDevices.push(device);
            }
        });

        return outputDevices;
    } catch (error) {
        console.log(error);
    }
}

export const getMediaStream = async (isFront: Boolean, isVoiceOnly: Boolean, videoSourceId: any)=> {
    const mediaConstraints = {
        audio: true,
        video: {
            facingMode: isFront ? "user" : "environment",
            frameRate: 30,
            width: 640,
            height: 480,
            deviceId: videoSourceId
        }
    }

    let localMediaStream: MediaStream | null = null;

    try {
        const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

        if (isVoiceOnly) {
            let videoTrack = await mediaStream.getVideoTracks()[ 0 ];
            videoTrack.enabled = false;
        };

        localMediaStream = mediaStream;
        return localMediaStream;
    } catch (error) {
        console.log(error);
    }
}

export const getStream = async (isFront: Boolean = true, isVoiceOnly: Boolean = false) => {
    const sources = await getMediaDevices();

    let videoSourceId;
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        if (source.kind === "videoinput" && source.facing === (isFront ? "front" : "environment")) {
            videoSourceId = source.deviceId;
        }
    }

    const stream = await getMediaStream(isFront, isVoiceOnly, videoSourceId);

    if (typeof stream !== 'boolean') return stream;
    return null;
};