import {
  fetchContacts,
  updateSelectedUserMessages,
  createGroup,
  deleteGroup,
  updateStatus,
  updateMood,
  deleteMessages,
  updateContactList,
  userExitGroup
} from '../../../redux/actions';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class ChatHelperService {

  forwadingChat = false;
  // This gets the email
  mapMessageParticipantIdToUsername = (messages, currentUsername, currentUserId, selectUserUsername): any => {
    return messages.map(message => {
      let user = '';

      if (message.senderId === currentUserId) {
          message.senderId = currentUsername;
          user = currentUsername;
      } else {
        message.senderId = selectUserUsername;
        user = selectUserUsername;
      }

      if (message.recipientId === currentUserId) {
          message.recipientId = currentUsername;
          user = currentUsername;
      } else {
        message.recipientId = selectUserUsername;
        user = selectUserUsername;
      }
      message.user = user;
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

 composeAndSendPrivateMessage = (msg, component) => {
 
  const { timeSent, senderId } = msg;
    const time = component.chatPanelService.formatChatTime(timeSent);
    msg = { ...msg, timeSent: time };

   component.dispatchUpdateMessage(senderId, [msg]);
    component.updateScreenMessages();
}

notificationObject = (msg, title, component) => {
  const isFile = ['img', 'aud', 'doc'].includes(msg.messageType);
  const sender = component.allContacts.find(contact => msg.senderId === contact.id);
  const groupMessageSender = component.allContacts.find(contact => msg.senderId === contact.id);
  const senderUsername = sender && sender.userename;
  const groupName = groupMessageSender && groupMessageSender.username;
  const name = senderUsername || groupName || component.loggedInUser;
  const notificationTitle = `${title} from ${name}`;
  const notificationOptions = {
        body: isFile ? `${senderUsername || name} shared a file` : msg.content,
        icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
        };
      return { notificationTitle, notificationOptions };
}
  
  socketConnections = (component) => {
    return {
      privateMessage: msg => {
        const { timeSent, senderId } = msg;
        const time = component.chatPanelService.formatChatTime(timeSent);
        const { notificationOptions, notificationTitle } = this.notificationObject(msg, 'New private message', component);

        msg = { ...msg, timeSent: time };
          component.dispatchUpdateMessage(senderId, [msg]);
          component.updateScreenMessages();

        this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
  
      senderPrivateNotification: (msg) => {
        const { timeSent, senderId, recipientId } = msg;
        const time = component.chatPanelService.formatChatTime(timeSent);

        
        msg = { ...msg, timeSent: time };
          component.dispatchUpdateMessage(recipientId, [msg]);
          component.updateScreenMessages(); 

      },
      groupMessage: (msg) => {
        const { content, timeSent, groupId, messageType, senderId, id, displayName } = msg;
        const time = component.chatPanelService.formatChatTime(timeSent);
        const message = { content, timeSent: time, groupId, senderId, messageType, id, displayName };
        const { notificationOptions, notificationTitle } = this.notificationObject(msg, 'New group message', component);
        component.dispatchUpdateMessage(groupId, [message]);
        component.updateScreenMessages();

        this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
      newGroupUpdate: (newGroup) => {
        const group = {
            group: newGroup,
            groupId: newGroup.id,
            isAdmin: false,
            messages: this.getMessagesFromContactList(newGroup.id, component.allContacts) || [],
          };
          component.ngRedux.dispatch(updateContactList(group));

          const notificationTitle = `New Group: ${newGroup.name}`;
          const notificationOptions = {
          body: `You have been added to a new group - ${newGroup.name}`,
          icon: 'assets/icons/notification-icons/newGroupIcon.svg',
          };
          this.composeAndSendNotification(notificationTitle, notificationOptions, component);
      },
      exitGroupUsersUpdate: group => {
          console.log(group);
      },

      exitGroup: groupId => {
        const groupIndex = component.allContacts.findIndex(contact => contact.groupId === groupId);
        this.findNextContactAndDispatch(groupId, groupIndex, component);
       component.ngRedux.dispatch(userExitGroup(groupId));
       component.messagesList = [];
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
  // fetchContacts = (component) => {
  //   component.chatPanelService.fetchContacts()
  //       .subscribe((contacts) => {
  //           component.allContacts = contacts.data;
            
  //       });                
  //   }

   /**
   * Fetch user chat groups
   *
   */
  mergeGroupsAndContacts = async (fetchedContacts, component) => {

    return component.chatPanelService.fetchUserChatGroups()
        .subscribe(({ data }) => {

          if ( component && fetchedContacts) {
          console.log(fetchedContacts);
        const contacts = [ ...fetchedContacts, ...data].map((contact) => {
            contact.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
            contact.messages = [];
           
            const privateChat = contact.id && true;
            const key = privateChat ? 'username' : 'groupId';  // Key is eithr usrnamme or groupId
            const keyValue = privateChat ? contact.username : contact.groupId;
            const userId = contact.id ? contact.id : contact.groupId;
            component.selectedContactId = contact.id ? contact.id : contact.groupId;
             this.fetchChatHistory({ privateChat, [key]: keyValue }, userId, component);
              return contact;
        });

         component.ngRedux.dispatch(fetchContacts(contacts));
        }
      });
  }

   /**
     * Fetch  messages history
     *
     */

    fetchChatHistory = (params, userId = null, component) => {
      return component.chatPanelService.fetchChatHistory(params, component.page, component.pageLimit)
          .subscribe(response => {
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
      const { username, groupId } = component.selectedUser;
      const keyString = username ? 'username' : 'groupId';
      const keyValue = username ? username : groupId;
      const isPrivateChat = username && true;

      if (currentPosition === 0) {
          component.page += 1;
          return component.chatPanelService.fetchChatHistory(
              { 
                privateChat: isPrivateChat, 
                [keyString]: keyValue 
              }, 
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
    selectChatPartner = (user, component): any => {
      const idToUse = user.id ? user.id : user.groupId;
        
      if (component.openChatBar) {
        component.openChatBar();
      }
      component.showInputSelector = false;
      component.selectedUser = user;
      component.showCreateGroupForm = false;
      component.showReplyForm = true;
      component.selectedContactId = idToUse;
      component.contactsWithoutGroups = component.allContacts.filter(contact => contact.id);

      if (user.messages && user.messages.length !== 0) {
          component.setPlaceHolderVisibility('', false, component);
          component.messagesList = this.getMessagesFromContactList(idToUse, component.allContacts);
          return;
      }
      
      component.messagesList = [];
      component.setPlaceHolderVisibility('Start a conversation', true, component);
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
  createGroup = (form, component) => {
    const { groupName } = form.value;
    if (!groupName) {
      return component.matSnackBar.open('Group name is required', '');
    }
      component.chatPanelService.createGroup({name: groupName})
        .subscribe(group => {
          component.showReplyForm = true;
          component.showCreateGroupForm = false;
          component.selectedUser = {group, groupId: group.id, isAdmin: true, messages: [] };
          component.selectedContactId = group.id;
          component.ngRedux.dispatch(createGroup(component.selectedUser));
          component.updateScreenMessages();
          if (component.messagesList.length === 0) {
            component.setPlaceHolderVisibility('Start a group conversation', true);
            form.reset();
            return;
          }
          component.setPlaceHolderVisibility('', false);
            form.reset();
      });
        
  }

  addUserToGroup = (user, component) => {
    const { username } = user;
    const { groupId } = component.selectedUser;
    component.chatConnection.invoke('AddUserToGroup', {username, groupId})
    .catch(error => console.log(error));
    component.matSnackBar.open(`${username} added to group`, 'OK');
  } 

   /**
     *  Delete group
     *
    */

   deleteGroup = (component) => {
    const { groupId } = component.selectedUser;
    component.chatPanelService.deleteGroup(groupId)
        .toPromise()
        .then(() => {
            component.messagesList = [];
            component.matSnackBar.open('Group deleted', 'close');
            const groupIndex = component.allContacts.findIndex(contact => contact.groupId === groupId);
            this.findNextContactAndDispatch(groupId, groupIndex, component);

        })
        .catch(error => console.log(error));
  }

  findNextContactAndDispatch = (groupId, groupIndex, component) => {

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
  }

  exitGroup = (component, groupId, username) => {
    component.chatConnection.invoke('RemoveUserFromGroup', { groupId, username});
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
        this.setPlaceHolderVisibility('', false, component);
        return form.reset();
      } 
      this.sendGroupMessage(message, component);
      form.reset();
      this.setPlaceHolderVisibility('', false, component);
  }


   /**
   * Send group message
   *
   */
  sendGroupMessage = (message, component, messageType = 'txt', displayName = '', isForwarded = false): void  => {
      const { group } = component.selectedUser;
      const messagePaylod = {
          groupId: group.id,
          senderId: component.userCredentials.userId,
          content: message,
          displayName,
          messageType,
          isForwarded,
          sender: component.loggedInUser
      };
      component.chatConnection.invoke('SendGroupMessage', messagePaylod)
          .catch(error => console.log(error));
  }

  /**
   * Send private message
   *
   */
  sendPrivateMessage = (message, component, messageType = 'txt', displayName = undefined, isForwarded = false): void => {
      const { username, id } = component.selectedUser;
      const messagePaylod = {
        senderId: component.userCredentials.userId,
        recipientId: id,
        content: message,
        messageType,
        displayName,
        isForwarded
    };
      component.chatConnection.invoke('SendPrivateMessage', username, messagePaylod)
      .catch(error => console.log(error));
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
      if (file.size > 20000000) {
        return component.matSnackBar.open('Max size of 20MB allowed', 'Ok');
      }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

      component.chatPanelService.sendChatFile(formData)
        .toPromise()
        .then(response => {
          const { urlString } = response;
          const { id } = component.selectedUser;

          if (id) {
          return this.sendPrivateMessage(urlString, component, fileType, file.name);
         }
         component.chatHelperService.sendGroupMessage(urlString, component, fileType, file.name);

        })
        .catch(() => {});
    }
  
    getChatFile = (component, messageId) => {
      component.chatPanelService.getChatFile(messageId) 
        .toPromise()
        .then(response => console.log(response))
        .catch(error => console.log(error));
    }

    getMediaExt = (fileName) => {
      return fileName.substr(fileName.lastIndexOf('.') + 1 ).toLowerCase();
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

}

cancelChatSelection = (component) => {
  component.showInputSelector = false;
  component.showReplyForm = true;
  component.selectedMessages = [];
  component.selectedIndexes = [];
}

 // This gets selected messages to be forwarded
 getSelectedMessages = (message, index, component): any => {
  if (component.selectedIndexes.includes(index)) {
   component.selectedMessages = component.selectedMessages.filter(msg => msg.index !== index);
   component.selectedIndexes = component.selectedIndexes.filter(ind => ind !== index);
   return;
  }

  if (!message.id && component.messagesList.length === 1) {
    message.id = 1;
  }

  if (!message.id && component.messagesList.length > 1) {
    const suggestedId = component.messagesList[index - 1].id;
    message.id = suggestedId + 1;
  }

  component.selectedIndexes.push(index);
  const { content, messageType, id, displayName } = message;
  component.selectedMessages.push({content, index, messageType, id, displayName });
  component.selectedMessages.sort((a, b) => a - b);
}

 // Forward chat 
  forwardChat = (selectedContact, component) => {
    const isForwarded = true;
    component.selectedMessages.forEach(message => {
      const { content, messageType, displayName } = message;
    if (selectedContact.groupId) {
        this.sendGroupMessage(content, component, messageType, displayName, isForwarded);
        return component.enableInputSelector(false, true);
    }
    this.sendPrivateMessage(content, component, messageType, displayName, isForwarded);
    component.enableInputSelector(false, true);
    component.openSideBar = true;
    this.forwadingChat = true;
    this.selectChatPartner(selectedContact, component);
      
    });
  }

  clearChat = async (component) => {
    component.selectedMessages = component.messagesList;
   await this.deleteMessages(component);
   component.messageList = [];
  }

  deleteMessages = (component) => {
    const messageIds = [];
  
    component.selectedMessages.map(message => messageIds.push(message.id));

      if (component.selectedUser.id) {
       return this.deletePrivateMessage(messageIds, component);
      }
      this.deleteGroupMessage(messageIds, component);
    }

  deletePrivateMessage = (messageIds, component) => {
      component.chatPanelService.deletePrivateMesssages({ messageIds })
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

      deleteGroupMessage = (messageIds, component) => {
      component.chatPanelService.deleteGroupMesssages({ messageIds })
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

  toggleNotificationSettings = (shouldSendNotification, component) => {
      component.isNotificationAllowed = shouldSendNotification;
  }

  exportChat = (component) => {
    const zip = new JSZip();
    const imageFolder = zip.folder('chatFiles');
    const messagesToExport = component.chatHelperService.mapMessageParticipantIdToUsername(
        component.messagesList, 
        component.loggedInUser,
        component.userCredentials.userId,
        component && component.selectedUser.username
        );
        
    let chatMessagesString = '\n';

    messagesToExport.map(message => {

        let messageContent = '';

        if (message.messageType !== 'txt') {
            const imgData = message.content;
            imageFolder.file(message.displayName, imgData, { basee64: true });
            messageContent = message.displayName;
        } else {
          messageContent = message.content;
        }

        chatMessagesString  += `[${message.timeSent}]: ${message.user}: ${messageContent}\n`;
    });

    zip.file('chatMessages.txt', chatMessagesString);
    zip.generateAsync({ type: 'blob'})
        .then(content => {
            saveAs(content, 'exported-chat');
        });
  }

  blockContact = (component) => {
    component.chatPanelService.blockContact(component.userCredentials.userId, component.selectedUser.id)
      .toPromise()
      .then(() => {
        component.matSnackBar.open('User blocked', 'Ok');
      })
      .catch(error => component.matSnackBar.open(error.message, 'Ok'));
  }

  addNewGroupAdmin = (selectedAdmin, selectedGroupId, component) => {
    if (selectedGroupId === (component.selectedUser && component.selectedUser.groupId)) {
      component.chatConnection.invoke('UpdateUserAdminStatus',  selectedGroupId, selectedAdmin.username);
    }
  }
}
