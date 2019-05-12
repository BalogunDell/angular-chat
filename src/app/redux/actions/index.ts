import { AllEnums } from 'app/enums';

export const FETCH_CONTACTS = 'FETCH_CONTACTS';
export const FETCH_PRIVATE_MESSAGES = 'FETCH_PRIVATE_MESSAGES';
export const FETCH_GROUP_MESSAGES = 'FETCH_GROUP_MESSAGES';
export const SET_SELECTED_USER = 'SET_SELECTED_USER';
export const UPDATE_SELECTED_USER_MESSAGE = 'UPDATE_SELECTED_USER_MESSAGE';
export const CREATE_GROUP = 'CREATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SET_SELECTED_USER_INFO = 'SET_SELECTED_USER_INFO';

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

export const updateSelectedUserMessages = (userIndex, message, messageFromScroll = false) => {
  return {
    type: UPDATE_SELECTED_USER_MESSAGE,
    userIndex,
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
