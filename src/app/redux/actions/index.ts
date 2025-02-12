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
export const UPDATE_CURRENT_USER_MESSAGES = 'UPDATE_CURRENT_USER_MESSAGES';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const DELETE_MESSAGES = 'DELETE_MESSAGES';
export const SAVE_CONNECTION = 'SAVE_CONNECTION';
export const UPDATE_CONTACT_LIST = 'UPDATE_CONTACT_LIST';
export const USER_EXIT_GROUP = 'USER_EXIT_GROUP';
export const SET_CHAT_PANEL_LOCATION = 'SET_CHAT_PANEL_LOCATION';
export const SET_CURRENT_EMAIL = 'SET_CURRENT_EMAIL';
export const UPDATE_USER_UNREAD_MESSAGES = 'UPDATE_USER_UNREAD_MESSAGES';

export const setUserCredentials = (userCredentials) => {
  return {
    type: SET_USER_CREDENTIALS,
    userCredentials,
  };
};

export const saveConnection = (connection) => {
  return {
    type: SAVE_CONNECTION,
    connection,
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
export const updateCurrentUserMessages = (currentUserId, message) => {
  return {
    type: UPDATE_CURRENT_USER_MESSAGES,
    currentUserId,
    message,
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

export const updateUserUnreadMessages = (userId) => {
  return {
    type: UPDATE_USER_UNREAD_MESSAGES,
    userId,
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

export const setUserEmail = (email) => {
  return {
   type: SET_CURRENT_EMAIL,
   email
  };
};

export const deleteMessages = (userId, messageIds) => {
  return {
   type: DELETE_MESSAGES,
    userId,
    messageIds
  };
};
  export const updateContactList = (newContact) => {
    return {
     type: UPDATE_CONTACT_LIST,
      newContact
    };
};

export const userExitGroup = (groupId) => {
  return {
   type: USER_EXIT_GROUP,
    groupId
  };
};

export const setChatLocation = (({ chatLocation }) => {
  return {
    type: SET_CHAT_PANEL_LOCATION,
    chatLocation,
  };
});
