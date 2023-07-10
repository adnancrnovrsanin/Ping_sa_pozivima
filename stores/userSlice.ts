import { createSlice } from "@reduxjs/toolkit";
import { User } from "../models/UserModels";

interface StoredUsers {
    [key: string]: User;
}

interface UserState {
    storedUsers: StoredUsers;
}

const initialState: UserState = {
    storedUsers: {}
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setStoredUsers: (state, action) => {
            const { newUsers } = action.payload;
            
            let existingUsers = state.storedUsers;
            const usersArray = Object.values(newUsers);

            for (let i = 0; i < usersArray.length; i++) {
                const userData = usersArray[i];
                // @ts-ignore
                existingUsers = { ...existingUsers, [userData.phoneNumber]: userData };
            }

            state.storedUsers = existingUsers;
        },
        addStoredUser: (state, action) => {
            const { user } = action.payload;
            // @ts-ignore
            state.storedUsers[user.phoneNumber] = {...user};
        },
        editStoredUser: (state, action) => {
            const { user } = action.payload;
            // @ts-ignore
            state.storedUsers[user.phoneNumber] = user;
        }
    }
});

export const { setStoredUsers, addStoredUser, editStoredUser } = userSlice.actions;
export default userSlice.reducer;