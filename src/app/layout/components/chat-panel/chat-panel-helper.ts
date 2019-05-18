import {
  fetchContacts,
  updateSelectedUserMessages,
  createGroup,
  deleteGroup,
  updateStatus,
  updateMood,
  deleteMessages,
  setSelectedUser
} from '../../../redux/actions';

import * as moment from 'moment';
import { AllEnums } from 'app/enums';

export class ChatHelperService {

  // This gets the email
  mapMessageParticipantIdToUsername = (messages, contacts, currentUser): any => {
    return messages.map(message => {
      message.senderId = currentUser;
      const recipient = contacts.find(contact => contact.id === message.recipientId);
      message.recipientId = recipient ? recipient.username : currentUser;
      return message;
    });
  }

  getMessagesFromContactList = (userId, contacts) => {
    const contact = contacts.find(currentContact => {
      const { id, groupId } = currentContact;
      const idToUse = id ? id : groupId; 
      return idToUse === userId;
    });
    return contact && contact.messages;
  }

  makeSocketConnection = (token) => {
    return {
      connection: () => {
        const signalR  = require('@aspnet/signalr');
          const connect = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/chatHub', { 
            accessTokenFactory: () => token
        })
        .build();
        return connect;
      },
  };
}
  
  socketConnections = (token, component) => {
    return {
      privateMessage: async (msg) => {
        let isFile = false;
        if (['img', 'aud', 'doc'].includes(msg.messageType)) {
           await component.chatPanelService.getChatFile(token, parseInt(msg.content, 10))
                .toPromise()
                .then(response => {
                    msg = response.data;
                    isFile = true;
                });
        }
        const { content, timeSent, senderId, messageType, id } = msg;
        const displayName = isFile && msg.displayName;
        const chatTime = component.chatPanelService.formatChatTime(timeSent);
        const message = { content, chatTime, senderId, messageType, displayName, id };
        component.dispatchUpdateMessage(senderId, [message]);
        component.updateScreenMessages();

        const notificationTitle = 'New message';
        const notificationOptions = {
        body: isFile ? 'A file has been sent to you' : message.content,
        icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
        };

        this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
      groupMessage: (msg) => {
        const { content, timeSent, senderId, messageType } = msg;
        const chatTime = component.chatPanelService.formatChatTime(timeSent);
        const message = { content, chatTime, senderId, messageType };

        component.dispatchUpdateMessage(senderId, [message]);

        const notificationTitle = 'New group message';
        const notificationOptions = {
        body: message.content,
        icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
        };

        this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
      newGroupUpdate: (newGroup) => {
        component.allContacts.unshift({
            group: newGroup,
            groupId: newGroup.id,
            isAdmin: false,
            messages: this.getMessagesFromContactList(newGroup.id, component.allContacts),
          });
          const notificationTitle = `New Group: ${newGroup.name}`;
          const notificationOptions = {
          body: `You have been added to a new group - ${newGroup.name}`,
          icon: 'assets/icons/notification-icons/newGroupIcon.svg',
          };
          this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
      updateUserStatus: (status) => {
        component.chatConnection.invoke('UpdateUserStatus', status);
      },

      onStatusUpdateCompleted: (username, status) => {
        component.ngRedux.dispatch(updateStatus(username, status));
      },
      updateUserMood: (mood) => {
        component.chatConnection.invoke('UpdateUserMood', mood);
      },
      onMoodUpdateCompleted: (username, mood) => {
        component.ngRedux.dispatch(updateMood(username, mood));
      }
    };
  }

/**
 * Fetch all contacts
 *
 */
  fetchContacts = (token, component) => {
    component.chatPanelService.fetchContacts(token)
        .subscribe((contacts) => {
            component.allContacts = contacts.data;
        });                
    }

   /**
   * Fetch user chat groups
   *
   */
  mergeGroupsAndContacts = async (token, component) => {
    await this.fetchContacts(token, component);

    return component.chatPanelService.fetchUserChatGroups(token)
        .subscribe(({ data }) => {
          if ( component && component.allContacts) {
          
        const contacts = [ ...component.allContacts, ...data].map(contact => {
            contact.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
            contact.messages = [];
           
            const privateChat = contact.id && true;
            const key = privateChat ? 'username' : 'groupId';  // Key is eithr usrnamme or groupId
            const keyValue = privateChat ? contact.username : contact.groupId;
            const userId = contact.id ? contact.id : contact.groupId;
            component.selectedContactId = contact.id ? contact.id : contact.groupId;
             this.fetchChatHistory(token, 
                { privateChat, [key]: keyValue }, userId, component);
              return contact;
        });

  
        component.ngRedux.dispatch(fetchContacts(contacts));
        component.ngRedux.dispatch(updateStatus(component.loggedInUser, 'online'));
        }
      });
  }

   /**
     * Fetch  messages history
     *
     */

    fetchChatHistory = (token, params, userId = null, component) => {
      component.setPlaceHolderVisibility('Fetching messages...', true);
      return component.chatPanelService.fetchChatHistory(token, params, component.page, component.pageLimit)
          .subscribe(response => {
            component.setPlaceHolderVisibility('', false);
              const {message} = response;
              const messages = message.map(msg => {
                  msg['timeSent'] = component.chatPanelService.formatChatTime(msg.timeSent);
                  msg['showMessageActions'] = false;
                  return msg;
              });
              component.dispatchUpdateMessage(userId, messages);
              component.updateScreenMessages();
          });
  }

  /**
     * Load more chats on screen scroll
     *
     */
    loadMoreMessagesOnScroll = (event, component): any => {
      const currentPosition = event.target.scrollTop;
      const { username } = component.selectedUser;
      if (currentPosition === 0) {
          component.page += 1;
          return component.chatPanelService.fetchChatHistory(
              component.userCredentials.token, 
              { privateChat: true, username }, 
              component.page, 
              component.pageLimit
          ).subscribe(response => {
              const {message} = response;
              if (message.length !== 0 ) {
                  const modifiedMessages = message.map(msg => {
                      msg['timeSent'] = component.chatPanelService.formatChatTime(msg.timeSent);
                      msg['showMessageActions'] = false;
                      return msg;
                  });
                  component.dispatchUpdateMessage(component.selectedContactId, modifiedMessages, true);
                  component.updateScreenMessages();
              }
          });
      }
  }

   /**
     * Select a chat partner
     *
     */
    selectChatPartner = (user, component, openSideBar): any => {
      const idToUse = user.id ? user.id : user.groupId;
      if (openSideBar) {
          component.openChatBar();
      }
      component.showInputSelector = false;
      component.chatPanelService.requestChatNotificationPermission();
      component.selectedUser = user;
      component.selectedContactId = idToUse;
      component.contactsWithoutGroups = component.allContacts.filter(contact => contact.id);
      if (user.messages && user.messages.length !== 0) {
          component.messagesList = this.getMessagesFromContactList(idToUse, component.allContacts);
          component.scrollToBottom(4000);
          return;
      }
      component.messagesList = [];
  }


  updateScreenMessages = (component) => {
    if (!component.selectedUser) { return; }
    const { id, groupId } = component.selectedUser;
    const idToUse = id ? id : groupId;
    component.messagesList = this.getMessagesFromContactList(idToUse, component.allContacts);
}

dispatchUpdateMessage = (userId, modifiedMessages, component, messageFromScroll = false) => {
  component.ngRedux.dispatch(updateSelectedUserMessages(
        userId, 
        modifiedMessages, 
        messageFromScroll
    ));
}
  createGroup = (token, form, component) => {
    const { groupName } = form.value;
    if (!groupName) {
      return component.matSnackBar.open('File type not supported', '');
    }
      component.chatPanelService.createGroup({name: groupName}, token)
        .subscribe(group => {
          component.showReplyForm = true;
          component.showCreateGroupForm = false;
          component.selectedUser = {group, groupId: group.id, isAdmin: true, messages: [] };
          component.selectedContactId = group.id;
          component.ngRedux.dispatch(createGroup(component.selectedUser));
          if (component.messagesList.length === 0) {
              component.setPlaceHolderVisibility('Start a group conversation', true);
          }
      });
        form.reset();
  }

  addUserToGroup = (user, component) => {
    const { username } = user;
    const { groupId } = component.selectedUser;
    component.chatConnection.invoke('AddUserToGroup', {username, groupId})
    .catch(error => console.log(error));
  } 

   /**
     *  Delete group
     *
    */

   deleteGroup = (component) => {
    const { token } = component.userCredentials;
    const { groupId } = component.selectedUser;
    component.chatPanelService.deleteGroup(token, groupId)
        .toPromise()
        .then(() => {
            component.messagesList = [];
            component.matSnackBar.open('Group deleted', 'close');
            const groupIndex = component.allContacts.findIndex(contact => contact.groupId === groupId);
            if (groupIndex === 0) {
                component.selectedUser = component.allContacts[1];
                return component.ngRedux.dispatch(deleteGroup(groupId));
            }

            if (groupIndex === component.allContacts.length - 1) {
                component.selectedUser = component.allContacts[0];
                return component.ngRedux.dispatch(deleteGroup(groupId));
            }

            component.selectedUser = component.allContacts[groupIndex + 1];
            return component.ngRedux.dispatch(deleteGroup(groupId));

        })
        .catch(error => console.log(error));
  }


  /**********************************************************/
  /************Handles message features**********************/
  /****************************8*****************************/

   /**
     * Send private message
     *
     */
    sendMessage(form, component): void {
      const { message } = form.value;
      const { username } = component.selectedUser;
      const isMessageAPrivateMessage = username && true;
      if (isMessageAPrivateMessage) {
        this.sendPrivateMessage(message, component);
        return form.reset();
      } 
      this.sendGroupMessage(message, component);
      form.reset();
  }


   /**
   * Send group message
   *
   */
  sendGroupMessage = (message, component): void  => {
      const { group } = component.selectedUser;
      const messagePaylod = {
          groupId: group.id,
          senderId: component.userCredentials.userId,
          content: message,
          messageType: 'txt',
      };
      component.chatConnection.invoke('SendGroupMessage', messagePaylod)
          .catch(error => console.log(error));

           component.dispatchUpdateMessage(component.selectedContactId, [messagePaylod]);
           component.updateScreenMessages();
  }

  /**
   * Send private message
   *
   */
  sendPrivateMessage = (message, component, messageType = 'txt'): void => {
      const { username, id } = component.selectedUser;
      const messagePaylod = {
          senderId: component.userCredentials.userId,
          senderUsername:  component.loggedInUser,
          content: message,
          messageType,
      };
      component.chatConnection.invoke('SendPrivateMessage', username, messagePaylod)
      .catch(error => console.log(error));
      messagePaylod['timeSent'] = component.chatPanelService.formatChatTime(moment().format());
      messagePaylod['id'] = id;
      messagePaylod['showMessageActions'] = false;
      if (messageType !== 'txt') {
         return component.updateScreenMessages();
      }
      component.dispatchUpdateMessage(id, [messagePaylod]);
      component.updateScreenMessages();
  }

  /**
      * Send file in chat
      *
      */
     sendFile = (event, component): any => {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
      
      let fileType = '';

      if (!component.allExt.includes(fileExtension)) {
       return component.matSnackBar.open('File type not supported', '');
   }

      if (component.imageExt.includes(fileExtension)) {
          fileType = 'img';
      }

      if (component.audioExt.includes(fileExtension)) {
          fileType = 'aud';
      }

      if (component.files.includes(fileExtension)) {
       fileType = 'doc';
       }
   return this.handleFileUpload(file, fileType, component);
   
   }

    handleFileUpload = (file, fileType, component) => {
        const fileName = file.name;
       const fileReader = new FileReader();
       fileReader.readAsDataURL(file);
       fileReader.onload = (ev) => {
           const { username, groupId, id } = component.selectedUser;
           const messagePaylod = {
               senderId: component.userCredentials.userId,
               recieverUsername:  username || groupId,
               content: ev.target['result'].toString(),
               messageType: fileType,
               displayName: fileName
           };
           component.chatPanelService.sendChatFile(component.userCredentials.token, messagePaylod)
           .toPromise()
           .then(response => {
             messagePaylod['id'] = response.id;
             messagePaylod['timeSent'] = component.chatPanelService.formatChatTime(moment().format());
             messagePaylod['messageType'] = fileType;
             component.dispatchUpdateMessage(component.selectedContactId, [messagePaylod]);
             component.chatHelperService.sendPrivateMessage(id, component, fileType);
           })
           .catch(error => console.log(error));
       };
          
    }

    setPlaceHolderVisibility = (msg, condition, component) => {
      component.showPlaceHolderIconAndText = condition;
      component.placeholderMessage = msg;
   }

   showMessageActionsHandler = (condition, index, component): void => {
    component.messagesList[index]['showMessageActions'] = condition;
   }

   composeAndSendNotification = (notificationTitle, notificationOptions, component) => {
      if (component.isNotificationAllowed) {
         return component.chatPanelService.sendChatNotification(notificationTitle, notificationOptions);
      }
   }

   resetChatScreen = (component) => {
    if (component.messagesList.length === 0) {
        component.selectedUser = null;
        component.selectedContactId = null;
    }
  }
  
  resetScreenForCreateGroupChat = (component) => {
    component.showReplyForm = false;
    component.showCreateGroupForm = true;
   
 }

 enableInputSelector = (showInputSelector, showReplyForm, component) => {
  component.showInputSelector = showInputSelector;
  component.showReplyForm = showReplyForm;
  component.openSideBar = false;

}

cancelChatSelection = (component) => {
  component.showInputSelector = false;
  component.showReplyForm = true;
  component.selectedMessages = [];
  component.selectedIndexes = [];
  component.openSideBar = true;
}

 // This gets selected messages to be forwarded
 getSelectedMessages = (message, index, component): any => {
   console.log(component.openSideBar);
  if (component.selectedIndexes.includes(index)) {
   component.selectedMessages = component.selectedMessages.filter(msg => msg.index !== index);
   component.selectedIndexes = component.selectedIndexes.filter(ind => ind !== index);
   return;
  }
  component.selectedIndexes.push(index);
  const { content, messageType, id } = message;
  component.selectedMessages.push({content, index, messageType, id});
}

 // Forward chat 
  forwardChat = (selectedContact, component) => {
    component.selectedMessages.forEach(message => {
      const { content, messageType, id } = message;
      if (messageType !== 'txt') {
        return this.sendPrivateMessage(id.toString(), component, messageType);
      }
    if (selectedContact.groupId) {
        this.sendGroupMessage(content, component);
        return component.enableInputSelector(false, true);
    }
    component.chatHelperService.sendPrivateMessage(content, component, messageType);
    component.enableInputSelector(false, true);
    component.openSideBar = true;
      
    });
  }

  deleteMessages = (token, component) => {
    const messageIds = [];
  
    component.selectedMessages.map(message => messageIds.push(message.id));

      if (component.selectedUser.id) {
       return this.deletePrivateMessage(token, messageIds, component);
      }
      this.deleteGroupMessage(token, messageIds, component);
    }

      deletePrivateMessage = (token, messageIds, component) => {
        component.chatPanelService.deletePrivateMesssages(token, { messageIds })
       .toPromise()
       .then(() => {
        const modifiedMessages = component.messagesList.filter( message => {
          return !messageIds.includes(message.id);
        });
         component.messagesList = modifiedMessages;
         component.ngRedux.dispatch(deleteMessages(component.selectedContactId, messageIds));
         component.enableInputSelector(false, true);
         component.selectedMessages = [];
         component.selectedIndexes = [];
       })
       .catch(error => console.log(error));
  }

      deleteGroupMessage = (token, messageIds, component) => {
        component.chatPanelService.deleteGroupMesssages(token, { messageIds })
      .toPromise()
      .then(() => {
        const modifiedMessages = component.messagesList.filter( message => {
          return !messageIds.includes(message.id);
        });
        component.messagesList = modifiedMessages;
        component.ngRedux.dispatch(deleteMessages(component.selectedContactId, messageIds));
        component.enableInputSelector(false, true);
        component.selectedMessages = [];
        component.selectedIndexes = [];
      })
      .catch(error => console.log(error));
    }
    
 }
