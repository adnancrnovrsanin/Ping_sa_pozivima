import agent from "../../api/agent";
import { CreateMessageRequest } from "../../models/Message";

export const sendMessage = async (message: CreateMessageRequest) => {
    try {
        const result = await agent.MessageRequests.createMessageRequest(message);
        return result;
    } catch (error) {
        // @ts-ignore
        console.log(error.message ?? error);
    }
};