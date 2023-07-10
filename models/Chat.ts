export interface UserChat {
    id: number
    chat: Chat
    userPhoneNumber: string
    didUpdateLast: boolean
    creator: boolean
    admin: boolean
}

export interface CreateUserChatRequest {
    chat: Chat
    userPhoneNumber: string
    didUpdateLast: boolean
    creator: boolean
    admin: boolean
}

export interface Chat {
    id: string
    chatName: string | null
    chatImageUrl: string
    chatDescription: string
    chatType: string
    memberPhoneNumbers: string[]
    latestMessage: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateChatRequest {
    chatName: string;
    chatImageUrl: string | null;
    chatDescription: string | null;
    chatType: string
    memberPhoneNumbers: string[]
    creatorPhoneNumber: string
}

export interface UpdateChatRequest {
    id: string
    chatName: string | null
    chatImageUrl: string | null
    chatDescription: string | null
    chatType: string
    memberPhoneNumbers: string[] | null
    latestMessage: string | null
    createdAt: string | null
    updatedAt: string | null
}