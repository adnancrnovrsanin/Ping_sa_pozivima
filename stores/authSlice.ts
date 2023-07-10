import { createSlice } from "@reduxjs/toolkit";
import { User } from "../models/UserModels";

// Define a type for the slice state
interface AuthState {
    token: string | null;
    userData: User | null;
    didTryAutoLogin: boolean;
}

// Define the initial state using that type
const initialState: AuthState = {
    token: null,
    userData: null,
    didTryAutoLogin: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authenticate: (state, action) => {
            const { payload } = action;
            state.token = payload.token;
            state.userData = payload.user;
            state.didTryAutoLogin = false;
        },
        setDidTryAutoLogin: (state) => {
            state.didTryAutoLogin = true;
        },
        logout: (state) => {
            state.token = null;
            state.userData = null;
            state.didTryAutoLogin = false;
        },
        updateLoggedInUserData: (state, action) => {
            state.userData = { ...state.userData, ...action.payload.newData }
        }
    }
});

export const { authenticate, setDidTryAutoLogin, logout, updateLoggedInUserData } = authSlice.actions;
export default authSlice.reducer;