import { 
  FETCH_CONTACTS,
  SET_SELECTED_USER,
  UPDATE_SELECTED_USER_MESSAGE,
  CREATE_GROUP,
  SET_USER_CREDENTIALS,
  DELETE_GROUP,
  SET_CURRENT_USER,
  UPDATE_USER_STATUS,
  UPDATE_USER_MOOD,
  DELETE_MESSAGES,
  SAVE_CONNECTION,
  UPDATE_CONTACT_LIST,
  USER_EXIT_GROUP,
  SET_CHAT_PANEL_LOCATION,
  SET_CURRENT_EMAIL
} from '../actions';
import { initialState } from 'app/store';

export const rootReducer = (state= initialState, action) => {
  switch (action.type) {

    case SAVE_CONNECTION: {
      return {
        ...state,
        connection: action.connection
      };
    }
    case SET_CHAT_PANEL_LOCATION: {
      return {
        ...state,
        chatPanelLocation: action.chatLocation
      };
    }
    case SET_CURRENT_USER: {
      return {
        ...state,
        currentUser: action.user
      };
    }
    case SET_CURRENT_EMAIL: {
      return {
        ...state,
        loggedInUserEmail: action.email
      };
    }
    case FETCH_CONTACTS: {
      const { contacts } = action;
      return {
        ...state,
        contacts,
      };
    }
    case SET_USER_CREDENTIALS: {
      return {
        ...state,
        userCredentials: action.userCredentials,
      };
    }
    case SET_SELECTED_USER: {
      return {
        ...state,
        selectedUser: action.user,
        chatPanelLocation: action.chatPanelLocation
      };
    }
    case UPDATE_SELECTED_USER_MESSAGE: {
      const { userId, message, messageFromScroll } = action;
      const stateContacts = state['contacts'];

      if (!userId) { return state; }

      const mappedContacts = stateContacts.map(contact => {
        const idToUse = contact.id ? contact.id : contact.groupId;
          if (userId === idToUse) {
            const existingMessages = contact.messages;
            messageFromScroll ?
        contact.messages = message.concat(existingMessages)
     : contact.messages = [...existingMessages, ...message];
          }
        return contact;
      });

      return {
        ...state,
        contacts: mappedContacts,

      };
    }
    case CREATE_GROUP: {
      const { group } = action;
      const stateContacts = state['contacts'];
      stateContacts.unshift(group);
      return {
        ...state,
        contacts: stateContacts
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
    case DELETE_MESSAGES: {
      const { userId, messageIds } = action;
      const stateContacts = state['contacts'];
      const updateMessages = (ids, messages) => {
        const filtered = messages.filter((message) => {
          if (!ids.includes(message.id)) {
            return message;
          }
        });
        return filtered;
      };
        const modifiedContacts = stateContacts.map(contact => {
          if (contact.id === userId || contact.groupId === userId) {
            contact['messages'] = updateMessages(messageIds, contact['messages']);
          }
          return contact;
      });
      return {
        ...state,
        contacts: modifiedContacts,
      };
    }

    case UPDATE_USER_STATUS: {
      const { username, status } = action;
      const stateContacts = state['contacts'];
      const user = stateContacts && stateContacts.find(contact => contact.username === username);

      if (!user) {
        const currentUser = state['currentUser'];
        currentUser['status'] = status;
        return {
          ...state,
          currentUser,
        };
      }
  
      const mappedContacts = stateContacts && stateContacts.map(contact => {
        if (contact.username && contact.username === username) {
            contact.status = status;
        }
        return contact;
      });
      return {
        ...state,
        contacts: mappedContacts,
      };
    }

    case UPDATE_USER_MOOD: {
      const { username, mood } = action;
      const stateContacts = state['contacts'];
      const user = stateContacts && stateContacts.find(contact => contact.username === username);

      if (!user) {
        const currentUser = state['currentUser'];
        currentUser['mood'] = mood;
        return {
          ...state,
          currentUser,
        };
      }
  
      const mappedContacts = stateContacts && stateContacts.map(contact => {
        if (contact.username && contact.username === username) {
            contact.mood = mood;
        }
        return contact;
      });
      return {
        ...state,
        contacts: mappedContacts,
      };
    }
    case UPDATE_CONTACT_LIST: {
      const { newContact } = action;
      const updatedContacts = state['contacts'];
      updatedContacts.unshift(newContact);

      return {
        ...state,
        contacts: updatedContacts,
      };
    }

    case USER_EXIT_GROUP: {
      const { groupId } = action;
      const stateContacts = state['contacts'];
      const updatedContacts = stateContacts.filter(contact => contact.groupId !== groupId); 
      return {
        ...state,
        contacts: updatedContacts,
      };
    }
    
  }
};
