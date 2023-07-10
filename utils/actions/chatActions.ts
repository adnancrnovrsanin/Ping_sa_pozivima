import agent from "../../api/agent";
import { CreateMessageRequest, Message, MessageType } from "../../models/Message";
import { User } from "../../models/UserModels";
import { setChatsData, setUserChatsData } from "../../stores/chatsSlice";
import { setChatMessages } from "../../stores/messagesSlice";
import { store } from "../../stores/store";
import { setStoredUsers } from "../../stores/userSlice";
import { getUserDataByPhoneNumber } from "./userActions";

export const getUserChatsReturned = async (userPhoneNumber: string) => {
    try {
        const result = await agent.UserChatRequests.getUserChatsRequest(userPhoneNumber);

        return result;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getUserChats = async (userPhoneNumber: string) => {
    const storedUsers = store.getState()?.users?.storedUsers;
    try {
        const result = await agent.UserChatRequests.getUserChatsRequest(userPhoneNumber);
        var chatsData = {};
        var userData = {};

        for (let i = 0; i < result.length; i++) {
            var userChats = result[i];
            chatsData = { ...chatsData, [userChats.chat.id.toString()]: userChats.chat };
            getChatMessages(userChats.chat.id);
            
            for (let j = 0; j < userChats.chat.memberPhoneNumbers.length; j++) {
                const member = userChats.chat.memberPhoneNumbers[j];
                if (member !== userPhoneNumber && !storedUsers[member]) {
                    var user = await getUserDataByPhoneNumber(member);
                    if (user) userData = { ...userData, [user.phoneNumber]: user };
                }
            }
        }
        
        store.dispatch(setStoredUsers({ newUsers: userData }));
        store.dispatch(setUserChatsData({ userChatsData: result }));
        store.dispatch(setChatsData({ chatsData: chatsData }));
        
        return chatsData ?? {};
    } catch (error) {
        // @ts-ignore
        console.log(error.message ?? error);
    }
}

export const getChatMessages = async (chatId: string) => {
    try {
        const result = await agent.MessageRequests.getChatMessagesRequest(chatId);
        store.dispatch(setChatMessages({ chatId: chatId, messagesData: result }));
    } catch (error) {
        // @ts-ignore
        console.log(error.message ?? error);
    }
} 

export const removeUserFromChat = async (userData: User | null, chatId: string, userToRemove: User | null) => {
    const storedUsers = store.getState()?.users?.storedUsers;
    try {
        await agent.UserChatRequests.removeUserChatRequest(userToRemove?.phoneNumber ?? "", chatId);

        const newInfoMessage: CreateMessageRequest = {
            message: userData?.phoneNumber === userToRemove?.phoneNumber ? `${userData?.phoneNumber} left the chat` : `${userData?.phoneNumber} removed ${userToRemove?.phoneNumber} from the chat`,
            mediaUrl: null,
            messageType: MessageType.INFO,
            senderPhoneNumber: userData?.phoneNumber ?? "",
            replyToMessageId: null,
            chatId: chatId
        }

        await agent.MessageRequests.createMessageRequest(newInfoMessage);
    } catch (error) {
        console.log(error);
    }
};