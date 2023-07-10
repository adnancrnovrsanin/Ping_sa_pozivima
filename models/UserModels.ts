export interface User {
    phoneNumber: string
    displayName: string
    about: string
    profilePictureUrl: string | null
}

export interface Authority {
    authority: string
}

export interface CheckUserResponse {
    userExists: boolean,
    user: User
}

export interface UpdateUserRequest {
    phoneNumber: string
    displayName: string | null
    about: string | null
    profilePictureUrl: string | null
}

export interface TokenCreationParams {
    phoneNumber: string
    pushTokens: string[]
}