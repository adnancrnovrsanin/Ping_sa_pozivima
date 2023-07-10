export interface Message {
    id: string
    message: string
    mediaUrl: string | null
    messageType: MessageType
    senderPhoneNumber: string
    replyToMessageId: string | null
    chatId: number
    createdAt: Date
}

export interface MessageDto {
    id: string
    message: string
    mediaUrl: string | null
    messageType: MessageType
    senderPhoneNumber: string
    replyToMessageId: string | null
    chatId: number
    createdAt: string
}

export interface CreateMessageRequest {
    message: string
    mediaUrl: string | null
    messageType: MessageType
    senderPhoneNumber: string
    replyToMessageId: string | null
    chatId: string
}

export enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    INFO = "INFO"
}