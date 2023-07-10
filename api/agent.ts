import axios, { AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "../constants/hosts";
import { store } from "../stores/store";
import { AuthRequest, AuthResponse, OTPRequest } from "../models/AuthInterfaces";
import { CheckUserResponse, UpdateUserRequest, User } from "../models/UserModels";
import { Message, CreateMessageRequest, MessageDto } from "../models/Message";
import { Chat, CreateChatRequest, UpdateChatRequest, UserChat } from "../models/Chat";

axios.defaults.baseURL = API_BASE_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response?.data;

axios.interceptors.request.use(config => {
    const token = store.getState()?.auth?.token;
    if (token && config?.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axios.interceptors.response.use(async response => {
    return response;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    delete: <T>(url: string) => axios.delete<T>(url).then(responseBody)
};

const Account = {
    generateOTP: (request: OTPRequest) => requests.post<string>(`/auth/otp`, request),
    authenticate: (request: AuthRequest) => requests.post<AuthResponse>(`/auth/authenticate`, request),
    getUser: () => requests.get<User>('/user'),
    getUserByPhoneNumber: (phoneNumber: string) => requests.get<User>(`/user/${phoneNumber}`),
    checkUserExists: (phoneNumber: string) => requests.get<CheckUserResponse>(`/user/${phoneNumber}/exists`),
    checkIfUsersExist: (phoneNumbers: string[]) => requests.post<User[]>(`/user/contacts`, phoneNumbers),
    updateUser: (user: UpdateUserRequest) => requests.put<User>(`/user`, user),
}

const ChatRequests = {
    createChatRequest: (request: CreateChatRequest) => requests.post<Chat>(`/chats`, request),
    updateChatRequest: (request: UpdateChatRequest) => requests.put<void>(`/chats`, request),
}

const UserChatRequests = {
    getUserChatsRequest: (phoneNumber: string) => requests.get<UserChat[]>(`/user/${phoneNumber}/chats`),
    removeUserChatRequest: (phoneNumber: string, chatId: string) => requests.delete<void>(`/user/remove/${phoneNumber}/from/${chatId}`),
}

const MessageRequests = {
    createMessageRequest: (request: CreateMessageRequest) => requests.post<MessageDto>(`/messages`, request),
    getMessageByIdRequest: (id: string) => requests.get<MessageDto>(`/messages/${id}/message`),
    getChatMessagesRequest: (chatId: string) => requests.get<MessageDto[]>(`/messages/${chatId}`),
}

const agent = {
    Account,  
    ChatRequests,
    UserChatRequests,
    MessageRequests,  
}

export default agent;