import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import {  MatSnackBar, MatDialog } from '@angular/material';
import { ChatFileViewerComponent } from './chat-units/chat-file-viewer/chat-file-viewer.component';
import * as moment from 'moment';
import { ChatModalComponent } from './chat-units/chat-modal/chat-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as jsPDF from 'jspdf'
import { ChatHelperService } from './chat-panel-helper';
@Component({
    selector     : 'chat-panel',
    templateUrl  : './chat-panel.component.html',
    styleUrls    : ['./chat-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})


export class ChatPanelComponent implements OnInit
{
    allContacts: any[];
    contactsWithoutGroups: any[];
    selectedUser = null;
    selectedUserIndex = null;
    sidebarFolded: boolean;
    userCredentials = null;
    chatConnection = null;
    messagesList = [];
    groupChatMessages = [];
    loggedInUser = null;
    showMessage = true;
    isNotificationAllowed = false;
    page = 1;
    pageLimit = 20;
    userChatGroups = [];
    showUserChatGroups = false;
    selectedGroupChat = null;
    chatHeader = 'Team Chat';
    showReplyForm = true;
    showCreateGroupForm = false;
    placeholderMessage = '';
    showPlaceHolderIconAndText = false;
    showMessageActions = false;
    imageExt = ['jpg', 'png', 'jpeg', 'gif'];
    audioExt = ['mp3', 'wma', 'ogg'];
    files = ['pdf', 'doc', 'txt', 'docx', 'csv'];
    allExt = [ ...this.imageExt, ...this.audioExt, ...this.files ];
    showInputSelector = false;
    selectedMessages = [];
    selectedIndexes = [];
    actionText = '';
    
    @ViewChild('container') private messageContainer: ElementRef;

    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * =
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private chatPanelService: ChatPanelService,
        private matSnackBar: MatSnackBar,
        private matDialog: MatDialog,
        private domSanitizer: DomSanitizer,
        private chatHelperService: ChatHelperService,
    )
    {
        // Set the defaults
        this.sidebarFolded = true;
        this.selectedUser = null;

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loggedInUser = localStorage.getItem('currentUser');
        this.chatPanelService.getToken({email: this.loggedInUser})
        .subscribe((response) => {
            this.userCredentials = response;

            localStorage.setItem('chatToken', response.token);

            this.makeSocketConnection();
            this.isNotificationAllowed = this.chatPanelService.requestChatNotificationPermission();
        });

        this.chatPanelService.selectecdContactFromModal.subscribe( async ({ selectedContact, index}) => {
           await this.selectChatPartner(selectedContact, index);
           await this.forwardChat(selectedContact);
           this.selectedMessages = [];
           this.selectedIndexes = [];
           
        });

        this.chatPanelService.selectecdFileType.subscribe(fileType => {
            let type = '';
            if (fileType === 'pdf') {
                type = 'application/pdf';
            }
            const messagesToExport = this.chatHelperService.mapMessageParticipantIdToUsername(
                this.messagesList, 
                this.allContacts, 
                this.loggedInUser
                );

            let chatMessagesString = '\n';

            messagesToExport.map(message => {
                const { timeSent } = message;
                message.time = this.chatPanelService.formatChatTime(timeSent);
                const user = message.senderId === this.loggedInUser ? this.loggedInUser : message.recipientId;
                chatMessagesString  += `[${message.time}]: ${user}: ${message.content}\n`;
            });

            const pdf = new jsPDF();

            pdf.text(chatMessagesString, 10, 10);
            pdf.save(`sample download`);
            
        });
    }

     
    // } 

     /**
     * Socket connection made here
     *
     */
    makeSocketConnection = (): void => {
        const signalR  = require('@aspnet/signalr');
             const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/chatHub', { 
                accessTokenFactory: () => this.userCredentials.token
            })
            .build();
            connection.on('privateMessage', async (msg) => {
                let isFile = false;
                if (['img', 'aud', 'doc'].includes(msg.messageType)) {
                   await this.chatPanelService.getChatFile(this.userCredentials.token, parseInt(msg.content, 10))
                        .toPromise()
                        .then(response => {
                            msg = response.data;
                            isFile = true;
                        });
                }
                console.log(msg);
                const { content, timeSent, senderId, messageType, id } = msg;
                const displayName = isFile && msg.displayName;
                const chatTime = this.chatPanelService.formatChatTime(timeSent);
                const message = { content, chatTime, senderId, messageType, displayName, id };
                console.log(message, 'message');
                this.messagesList.push(message);

                const notificationTitle = 'New message';
                const notificationOptions = {
                body: isFile ? 'A file has been sent to you' : message.content,
                icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
                };

                this.composeAndSendNotification(notificationTitle, notificationOptions);
            });

            // Group Message

            connection.on('groupMessage', msg => {
                const { content, timeSent, senderId, messageType } = msg;
                const chatTime = this.chatPanelService.formatChatTime(timeSent);
                const message = { content, chatTime, senderId, messageType };
                this.messagesList.push(message);
                const notificationTitle = 'New group message';
                const notificationOptions = {
                body: message.content,
                icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
                };
                this.composeAndSendNotification(notificationTitle, notificationOptions);
            });

            // Emit message on once a user has been added to a new group.
            connection.on('newGroupUpdate', newGroup => {
                this.allContacts.unshift({
                    group: newGroup,
                    groupId: newGroup.id,
                    isAdmin: false
                });
                const notificationTitle = `New Group: ${newGroup.name}`;
                const notificationOptions = {
                body: `You have been added to a new group - ${newGroup.name}`,
                icon: 'assets/icons/notification-icons/newGroupIcon.svg',
                };
                this.composeAndSendNotification(notificationTitle, notificationOptions);
            });

            connection.start();
            this.chatConnection = connection;
            this.fetchContacts(this.userCredentials.token);
    }

    /**
     * Fetch all contacts
     *
     */
    fetchContacts = (token) => {
        return this.chatPanelService.fetchContacts(token)
            .subscribe((contacts) => {
                contacts.data.map(contact => {
                    if (contact.username === this.loggedInUser) {
                        delete contacts.data.contact;
                    }
                    return contact.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
                });
                this.allContacts = contacts.data;
                this.fetchUserChatGroups();
            });                
    }

     /**
     * Fetch private messages history
     *
     */

    fetchChatHistory = (token, params) => {
        this.setPlaceHolderVisibility('Fetching messages...', true);
        return this.chatPanelService.fetchChatHistory(token, params, this.page, this.pageLimit)
            .subscribe(response => {
                this.setPlaceHolderVisibility('', false);
                const {message} = response;
                message.map(msg => {
                    msg['chatTime'] = this.chatPanelService.formatChatTime(msg.timeSent);
                    msg['showMessageActions'] = false;
                });
                this.messagesList = message.reverse();
                console.log(this.messagesList);
                if (this.messagesList.length === 0) {
                    this.setPlaceHolderVisibility('Start a conversation by typing below', true);
                } else {
                    this.setPlaceHolderVisibility('', false);
                }
            });
    }

    /**
     * Fetch user chat groups
     *
     */
    fetchUserChatGroups = () => {
        return this.chatPanelService.fetchUserChatGroups(this.userCredentials.token)
            .subscribe(({ data }) => {
            this.allContacts = [ ...this.allContacts, ...data];
            });
    }

    /**
     * Create a new group
     *
     */
    createGroup = (form: NgForm) => {        
        const { groupName } = form.value;
        this.chatPanelService.createGroup({name: groupName}, this.userCredentials.token)
            .subscribe(group => {
                this.setPlaceHolderVisibility('Start a group conversation', true);
                this.showReplyForm = true;
                this.showCreateGroupForm = false;
                this.selectedUser = {group, groupId: group.id, isAdmin: true};
                this.allContacts.unshift(this.selectedUser);
            });
        form.reset();
    }

     /**
     * Adds a new group
     *
     */
    addNewGroup = () => {
        this.messagesList = [];
        this.setPlaceHolderVisibility('Create a group', true);
        return this.resetScreenForCreateGroupChat();
     }
 
 
      /**
      * Adds a user to a group
      *
      */
     addUserToGroup = (user) => {
         const { username } = user;
         const { groupId } = this.selectedUser;
         this.chatConnection.invoke('AddUserToGroup', {username, groupId})
         .catch(error => console.log(error));
     }
 

     /**
     *  Delete group
     *
    */

    deleteGroup = () => {
        const modifyContact = () => this.allContacts = this.allContacts.filter(group => group.groupId !== groupId);
        const { token } = this.userCredentials;
        const { groupId } = this.selectedUser;
        console.log(this.selectedUser);
        this.chatPanelService.deleteGroup(token, groupId)
            .toPromise()
            .then(() => {
                this.matSnackBar.open('Group deleted', 'close');
                if (this.selectedUserIndex === 0) {
                    this.selectedUser = this.allContacts[1];
                    return modifyContact();
                }

                if (this.selectedUserIndex === this.allContacts.length - 1) {
                    this.selectedUser = this.allContacts[0];
                    return modifyContact();
                }

                this.selectedUser = this.allContacts[this.selectedUserIndex + 1];
                modifyContact();

            })
            .catch(error => console.log(error));
    }

     /*
     * @memberof ChatPanelComponent
     */
    openChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').unfoldTemporarily();
       if (!this.selectedUser && !this.selectedUserIndex) {
        // this.setPlaceHolderVisibility('Select a contact to start chatting', true);
       }
    }

     /**
     * Select a chat partner
     *
     */
    selectChatPartner = (user, index): any => {
        this.openChatBar();
        this.showInputSelector = false;
        this.chatPanelService.requestChatNotificationPermission();

        const tempUserId = this.selectedUser && this.selectedUser.id;
        const tempGroupId = this.selectedUser && this.selectedUser.groupId;

        if (tempUserId && (tempUserId === user.id) || tempGroupId && (tempGroupId === user.groupId)) { return; }
        
        this.selectedUser = user;
        this.selectedUserIndex = index;
        this.messagesList = [];
        this.page = 1;

        if (user.id) {
        return this.fetchChatHistory(this.userCredentials.token, 
            { 
                privateChat: true,
                username: user.username 
            });
        }
        this.fetchChatHistory(this.userCredentials.token, 
            { 
                privateChat: false,
                groupId: user.groupId
            });
        this.contactsWithoutGroups = this.allContacts.filter(contact => contact.id);
    }


     /**
     * Load more chats on screen scroll
     *
     */
    loadMoreMessagesOnScroll = (event): any => {
        const currentPosition = event.target.scrollTop;
        
        if (currentPosition === 0) {
            this.page += 1;
            return this.chatPanelService.fetchChatHistory(
                this.userCredentials.token, 
                { privateChat: true, username: this.selectedUser.username }, 
                this.page, 
                this.pageLimit
            ).subscribe(response => {
                const {message} = response;
                message.map(msg => {
                    msg['chatTime'] = this.chatPanelService.formatChatTime(msg.timeSent);
                    msg['showMessageActions'] = false;
                });
                const currentMessageList = this.messagesList;
                this.messagesList = message.reverse().concat(currentMessageList);
                if (message.length === 0 ) {
                    this.setPlaceHolderVisibility('', false);
                }
            });
        }
    }

    /**
     * Send private message
     *
     */
    sendMessage(form: NgForm): void {
        const { message } = form.value;
        const { username } = this.selectedUser;
        const isMessageAPrivateMessage = username && true;
        if (isMessageAPrivateMessage) {
          this.sendPrivateMessage(message);
          return form.reset();
        } 
        this.sendGroupMessage(message);
        form.reset();
    }

     /**
     * Send group message
     *
     */
    sendGroupMessage = (message): void  => {
        const { group } = this.selectedUser;
        const messagePaylod = {
            groupId: group.id,
            senderId: this.userCredentials.userId,
            content: message,
            messageType: 'txt',
        };
        console.log(messagePaylod);
        this.chatConnection.invoke('SendGroupMessage', messagePaylod)
        .catch(error => console.log(error));
    }

       /**
     * Send private message
     *
     */
    sendPrivateMessage = (message, messageType = 'txt'): void => {
        console.log(message);
        const { username } = this.selectedUser;
        const messagePaylod = {
            senderId: this.userCredentials.userId,
            senderUsername:  this.loggedInUser,
            content: message,
            messageType,
        };
        this.chatConnection.invoke('SendPrivateMessage', username, messagePaylod)
        .catch(error => console.log(error));
        messagePaylod['chatTime'] = this.chatPanelService.formatChatTime(moment().format());
        messagePaylod['showMessageActions'] = false;
        // if (messageType === 'txt') {
        //     this.messagesList.push(messagePaylod);
        // }
    }


    /**
     * Close chat bar on click
     *
     */
    closeChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').foldTemporarily();
        this.resetChatScreen();
    }

    /**
     * Toggle chat side bar
     *
     */
    toggleSidebarOpen(): void {
        this._fuseSidebarService.getSidebar('chatPanel').toggleOpen();
        this.resetChatScreen();
    }

    /**
     * Reset chat screen when closed
     *
     */
    resetChatScreen(): void {
        if (this.messagesList.length === 0) {
            this.selectedUser = null;
            this.selectedUserIndex = null;
        }
    }

    /**
     * Check if message is first of group
     *
     */

    isFirstMessageOfGroup(message, i): boolean {
        return (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].senderId !== message.senderId);
    }

    /**
     * CHheck if message is last of group
     *
     */
    isLastMessageOfGroup(message, i): boolean {
        return (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].senderId !== message.senderId);
    }


    /**
     * Send file in chat
     *
     */
    attachFile = (): void => {
       const inputElement = document.getElementById('chatFile');
       inputElement.click();
    }


    /**
     * Send file in chat
     *
     */
    scrollScreenUp = (): void => {
        const chatScreen = document.getElementById('container');
        chatScreen.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
     }


    /**
     * Send file in chat
     *
     */
    sendFile = (event): any => {
       const file = event.target.files[0];
       const fileName = file.name;
       const fileExtension = fileName.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
       
       let fileType = '';

       if (!this.allExt.includes(fileExtension)) {
        return this.matSnackBar.open('File type not supported', '');
    }

       if (this.imageExt.includes(fileExtension)) {
           fileType = 'img';
       }

       if (this.audioExt.includes(fileExtension)) {
           fileType = 'aud';
       }

       if (this.files.includes(fileExtension)) {
        fileType = 'doc';
        }
    return this.handleFileUpload(file, fileType);
    
    }

     handleFileUpload = (file, fileType) => {
         const fileName = file.name;
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (ev) => {
            const { username } = this.selectedUser;
            const messagePaylod = {
                senderId: this.userCredentials.userId,
                recieverUsername:  username,
                content: ev.target['result'].toString(),
                messageType: fileType,
                displayName: fileName
            };
            messagePaylod['chatTime'] = this.chatPanelService.formatChatTime(moment().format());
            messagePaylod['messageType'] = fileType;
            this.chatPanelService.sendChatFile(this.userCredentials.token, messagePaylod)
            .toPromise()
            .then(response => {
                const { id } = response;
                messagePaylod['id'] = id;
                this.messagesList.push(messagePaylod);
                this.sendPrivateMessage(id, fileType);
            })
            .catch(error => console.log(error));
        };
           
     }
     
     enableInputSelector = (showInputSelector, showReplyForm, action) => {
         this.showInputSelector = showInputSelector;
         this.showReplyForm = showReplyForm;
         if (action === 'deleteMessage') {
             this.actionText = 'Delete';
             return;
         } 
         
         if (action === 'forwardMessage') {
             this.actionText = 'Forward';
         }
     }

     cancelChatForwarding = () => {
         this.showInputSelector = false;
         this.showReplyForm = true;
         this.selectedMessages = [];
         this.selectedIndexes = [];
     }

     forwardChat = (selectedContact) => {
        this.selectedMessages.forEach(message => {
           const { content, messageType, id } = message;
           if (messageType !== 'txt') {
               console.log(message);
             return this.sendPrivateMessage(id.toString(), messageType);
           }
        if (selectedContact.groupId) {
            this.sendGroupMessage(content);
            return this.enableInputSelector(false, true, 'forwardMessage');
        }
        this.sendPrivateMessage(content, messageType);
        this.enableInputSelector(false, true, 'forwardMessage');
           
        });
     }

     deleteMessages = () => {
         console.log(this.selectedMessages);
     }

     openChatModal = () => {
         const dialog = this.matDialog.open(ChatModalComponent, {
            width: '50%',
            data: { message: 'Select a contact', allContacts: this.allContacts }
         });

         dialog.afterClosed().subscribe(selectedData => {
             console.log(selectedData);
         });
     }

     // This gets selected messages to be forwarded
     getSelectedMessage = (message, index): any => {
        if (this.selectedIndexes.includes(index)) {
         this.selectedMessages = this.selectedMessages.filter(msg => msg.index !== index);
         this.selectedIndexes = this.selectedIndexes.filter(ind => ind !== index);
         return;
        }
        this.selectedIndexes.push(index);
        const { content, messageType, id } = message;
        this.selectedMessages.push({content, index, messageType, id});
     }

     openFile = (fileContent, fileType) => {
        this.matDialog.open(ChatFileViewerComponent, {
            width: '60%',
            data: { fileContent, fileType },
        });
     }

     exportChat = (): void => {
        this.matDialog.open(ChatModalComponent, {
            width: '40%',
           data: { isExportingChat: true }
        });
     }
     resetScreenForCreateGroupChat = () => {
        this.showReplyForm = false;
        this.showCreateGroupForm = true;
       
     }

     setPlaceHolderVisibility = (msg, condition) => {
        this.showPlaceHolderIconAndText = condition;
        this.placeholderMessage = msg;
     }

     showMessageActionsHandler = (condition, index): void => {
         this.messagesList[index]['showMessageActions'] = condition;
     }

     composeAndSendNotification = (notificationTitle, notificationOptions) => {
        if (this.isNotificationAllowed) {
           return this.chatPanelService.sendChatNotification(notificationTitle, notificationOptions);
        }
     }

     sanitizeAndRedirect = (url) => {
        // const parentElement = document.getElementById('showFile');
        const anchorElement = document.createElement('a');
        const sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
        anchorElement.setAttribute('href', sanitizedUrl['changingThisBreaksApplicationSecurity']);
        anchorElement.setAttribute('target', '_blank');
        anchorElement.click();
    }
}
