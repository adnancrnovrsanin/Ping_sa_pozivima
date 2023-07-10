import { User } from "./UserModels";

export interface OTPRequest {
    phoneNumber: string;
}

export interface AuthRequest {
    phoneNumber: string;
    otp: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    newUser: boolean;
    tokenExpiration: string;
}