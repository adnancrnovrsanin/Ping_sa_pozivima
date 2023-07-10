import { createSlice } from "@reduxjs/toolkit";
import { User } from "../models/UserModels";

export interface StoredContacts {
    [key: string]: User;
}

interface ContactsState {
    storedContacts: StoredContacts;
}

const initialState: ContactsState = {
    storedContacts: {}
};

const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        setStoredContacts: (state, action) => {
            const { newContacts } = action.payload;

            let newContactsObject: StoredContacts = {};
            for (let i = 0; i < newContacts.length; i++) {
                const contact = newContacts[i];
                newContactsObject[contact.phoneNumber] = contact;
            }
            state.storedContacts = newContactsObject;
        },
        addNewContact: (state, action) => {
            const { contact } = action.payload;
            state.storedContacts[contact.phoneNumber] = JSON.parse(JSON.stringify(contact));
        }
    }
});

export const { setStoredContacts } = contactsSlice.actions;
export default contactsSlice.reducer;