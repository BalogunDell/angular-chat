import { 
  FETCH_CONTACTS,
  SET_SELECTED_USER,
  UPDATE_SELECTED_USER_MESSAGE,
  CREATE_GROUP,
  DELETE_GROUP,
  SET_SELECTED_USER_INFO
} from '../actions';

export const rootReducer = (state= {}, action) => {
  switch (action.type) {
    case FETCH_CONTACTS: {
      return {
        ...state,
        contacts: action.contacts
      };
    }
    case SET_SELECTED_USER: {
      return {
        ...state,
        user: action.user,
        chatPanelLocation: action.chatPanelLocation
      };
    }
    case UPDATE_SELECTED_USER_MESSAGE: {
      const { userIndex, message, messageFromScroll } = action;
      const stateContacts = state['contacts'];

      if (!userIndex) { return state; }

      const existingMessages = stateContacts[userIndex]['messages'];
      messageFromScroll ?
        stateContacts[userIndex]['messages'] = message.concat(existingMessages)
     : stateContacts[userIndex]['messages'] = [...existingMessages, ...message];

      return {
        ...state,
        contacts: stateContacts,
      };
    }
    case CREATE_GROUP: {
      const { group } = action;
      const contacts = state['contacts'];
      contacts.unshift(group);
      return {
        ...state,
        contacts,
      };
    }
    case DELETE_GROUP: {
      const { groupId } = action;
      const stateContacts = state['contacts'];
      const filteredContacts = stateContacts.filter(contact => {
        return contact.groupId !== groupId;
      });
      return {
        ...state,
        contacts: filteredContacts,
      };
    }
  }
};
