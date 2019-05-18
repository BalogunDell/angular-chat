import { AllEnums } from 'app/enums';

export const FETCH_CONTACTS = 'FETCH_CONTACTS';
export const FETCH_PRIVATE_MESSAGES = 'FETCH_PRIVATE_MESSAGES';
export const FETCH_GROUP_MESSAGES = 'FETCH_GROUP_MESSAGES';
export const SET_SELECTED_USER = 'SET_SELECTED_USER';
export const UPDATE_SELECTED_USER_MESSAGE = 'UPDATE_SELECTED_USER_MESSAGE';
export const CREATE_GROUP = 'CREATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SET_SELECTED_USER_INFO = 'SET_SELECTED_USER_INFO';
export const SET_USER_CREDENTIALS = 'SET_USER_CREDENTIALS';
export const UPDATE_USER_STATUS = 'UPDATE_USER_STATUS';
export const UPDATE_USER_MOOD = 'UPDATE_USER_MOOD';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const DELETE_MESSAGES = 'DELETE_MESSAGES';

export const setUserCredentials = (userCredentials) => {
  return {
    type: SET_USER_CREDENTIALS,
    userCredentials,
  };
};
export const fetchContacts = (contacts) => {
  return {
    type: FETCH_CONTACTS,
    contacts,
  };
};
export const setSelectedUser = (user, chatLocation) => {
  const { MAIN_CHAT_PANEL, SIDE_CHAT_PANEL } = AllEnums;
  const chatPanelLocation  = chatLocation === MAIN_CHAT_PANEL ? MAIN_CHAT_PANEL : SIDE_CHAT_PANEL  ;
  return {
    type: SET_SELECTED_USER,
    user,
    chatPanelLocation
  };
};
export const updateSelectedUserMessages = (userId, message, messageFromScroll = false) => {
  return {
    type: UPDATE_SELECTED_USER_MESSAGE,
    userId,
    message,
    messageFromScroll
  };
};
export const createGroup = (group) => {
  return {
    type: CREATE_GROUP,
    group,
  };
};
export const deleteGroup = (groupId) => {
  return {
    type: DELETE_GROUP,
    groupId,
  };
};
export const updateStatus = (username, status) => {
  return {
    type: UPDATE_USER_STATUS,
    username,
    status,
  };
};
export const updateMood = (username, mood) => {
  return {
    type: UPDATE_USER_MOOD,
    username,
    mood,
  };
};

export const setCurrentUser = (user) => {
  return {
   type: SET_CURRENT_USER,
    user
  };
};

export const deleteMessages = (userId, messageIds) => {
  return {
   type: DELETE_MESSAGES,
    userId,
    messageIds
  };
};
