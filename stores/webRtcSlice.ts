import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MediaStream } from "react-native-webrtc";

interface WebRtcState {
    localStreamUrl: string | null;
    remoteStreamUrl: string | null;
    gettingCall: boolean;
}

const initialState: WebRtcState = {
    localStreamUrl: null,
    remoteStreamUrl: null,
    gettingCall: false,
};

const webRtcSlice = createSlice({
    name: 'webRtc',
    initialState,
    reducers: {
        setLocalStreamUrl: (state, action: PayloadAction<string | null>) => {
            if (action.payload) state.localStreamUrl = action.payload;
            else state.localStreamUrl = null;
        },
        setRemoteStreamUrl: (state, action: PayloadAction<string | null>) => {
            if (action.payload) state.remoteStreamUrl = action.payload;
            else state.remoteStreamUrl = null;
        },
        setGettingCall: (state, action: PayloadAction<boolean>) => {
            state.gettingCall = action.payload;
        }
    }
});

export const { setLocalStreamUrl, setRemoteStreamUrl, setGettingCall } = webRtcSlice.actions;
export default webRtcSlice.reducer;