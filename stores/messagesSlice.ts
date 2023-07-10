import { createSlice } from "@reduxjs/toolkit";
import { Message, MessageDto } from "../models/Message";

interface ChatMessagesPayload {
    chatId: string;
    messagesData: MessageDto[];
}

interface ChatMessagesAction {
    type: string;
    payload: ChatMessagesPayload;
}

interface MessagesData {
    [key: string]: MessageDto[];
}

interface StarredMessages {
    [key: string]: MessageDto[];
}

interface MessagesState {
    messagesData: MessagesData;
    starredMessages: StarredMessages;
}

const initialState: MessagesState = {
    messagesData: {},
    starredMessages: {}
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setChatMessages: (state, action: ChatMessagesAction) => {
            const { chatId, messagesData } = action.payload;
            
            //@ts-ignore
            state.messagesData[chatId] = messagesData;

            state.messagesData = JSON.parse(JSON.stringify(state.messagesData));
        },
        addStarredMessage: (state, action) => {
            const { starredMessageData } = action.payload;

            //@ts-ignore
            state.starredMessages[starredMessageData.messageId] = starredMessageData;
        },
        removeStarredMessage: (state, action) => {
            const { messageId } = action.payload;
            //@ts-ignore
            delete state.starredMessages[messageId];
        },
        setStarredMessages: (state, action) => {
            const { starredMessages } = action.payload;
            state.starredMessages = { ...starredMessages };
        }
    }
});

export const { setChatMessages, addStarredMessage, removeStarredMessage, setStarredMessages } = messagesSlice.actions;
export default messagesSlice.reducer;