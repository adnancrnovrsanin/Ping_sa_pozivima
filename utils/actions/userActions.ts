import agent from "../../api/agent";

export const getUserDataByPhoneNumber = async (phoneNumber: string) => {
    try {
        const userData = await agent.Account.getUserByPhoneNumber(phoneNumber);
        return userData;
    } catch (error) {
        console.log(error);
    }
}

export const checkIfUserExists = async (phoneNumber: string) => {
    try {
        const result = await agent.Account.checkUserExists(phoneNumber);
        if (result.userExists) return result.user;
        else return null;
    } catch (error) {
        console.log(error);
    }
}