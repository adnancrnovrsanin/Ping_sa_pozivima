import { createSlice } from "@reduxjs/toolkit";
import { Chat, UserChat } from "../models/Chat";

interface ChatsData {
    [key: string]: Chat;
}
interface UserChatsData {
    [key: string]: UserChat;
}
interface ChatsState {
    userChatsData: UserChatsData;
    chatsData: ChatsData;
}

const initialState: ChatsState = {
    userChatsData: {},
    chatsData: {}
}

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setUserChatsData: (state, action) => {
            state.userChatsData = { ...action.payload.userChatsData };
        },
        setChatsData: (state, action) => {
            state.chatsData = { ...action.payload.chatsData };
        },
        updateUserChatsData: (state, action) => {
            const userChat = action.payload.userChat;
            state.userChatsData[userChat.id] = JSON.parse(JSON.stringify(userChat));
        },
        updateChatsData: (state, action) => {
            const chat = action.payload.chat;
            state.chatsData[chat.id] = JSON.parse(JSON.stringify(chat));
        },
        addChatsData: (state, action) => {
            const chat = action.payload.chat;
            state.chatsData[chat.id] = JSON.parse(JSON.stringify(chat));
        },
        clearChatsData: (state) => {
            state.chatsData = {}
        },
        clearUserChatsData: (state) => {
            state.userChatsData = {}
        },
        updateChatImageUrl: (state, action) => {
            const { id, chatImageUrl } = action.payload;
            const chat = state.chatsData[id];
            chat.chatImageUrl = chatImageUrl;
        }
    }
});

export const { setUserChatsData, clearChatsData, setChatsData, updateUserChatsData, updateChatsData, addChatsData, clearUserChatsData, updateChatImageUrl } = chatSlice.actions;
export default chatSlice.reducer;