import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewChecked, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import {  MatSnackBar, MatDialog } from '@angular/material';
import { ChatFileViewerComponent } from './chat-units/chat-file-viewer/chat-file-viewer.component';
import { ChatModalComponent } from './chat-units/chat-modal/chat-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as jsPDF from 'jspdf';
import { ChatHelperService } from './chat-panel-helper';

// REdux
import { NgRedux, select } from '@angular-redux/store';
import { AppStateI } from '../../../interfaces';
import {
    setUserCredentials, setCurrentUser, saveConnection, setChatLocation, updateStatus
} from '../../../redux/actions';
import { AllEnums } from 'app/enums';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
@Component({
    selector     : 'chat-panel',
    templateUrl  : './chat-panel.component.html',
    styleUrls    : ['./chat-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})


export class ChatPanelComponent implements OnInit, AfterViewInit {

    @ViewChildren(FusePerfectScrollbarDirective)
    private fusePerfectScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;
    private chatViewScrollbar: FusePerfectScrollbarDirective;

    allContacts = [];
    chatList = [];
    contactsWithoutGroups: any[];
    selectedUser = null;
    selectedContactId = null;
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
    audioExt = ['mp3', 'wma', 'ogg', 'mp4', 'mkv'];
    files = ['pdf', 'doc', 'txt', 'docx', 'csv', 'swf'];
    allExt = [ ...this.imageExt, ...this.audioExt, ...this.files ];
    showInputSelector = false;
    selectedMessages = [];
    selectedIndexes = [];
    actionText = '';
    currentUser = null;
    chatPanelLocation = null;
    openSideBar = true;
    disableNotification = false;
    unreadMessageCounter = 0;

    @select() contacts;
    @select('contacts') contacts$: Observable<any[]>;
    @select('currentUser') currentUser$: Observable<any[]>;
    @select('chatPanelLocation') chatPanelLocation$: Observable<any[]>;
    @select('loggedInUserEmail') loggedInUserEmail$: Observable<any[]>;

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
        private ngRedux: NgRedux<AppStateI>,
    )
    {
        // Set the defaults
        this.sidebarFolded = true;

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.SIDE_CHAT_PANEL }));

         this.loggedInUserEmail$.subscribe(email => {
            this.loggedInUser = email;
        });

        this.currentUser$.subscribe(user => {
            if (user) {
                this.loggedInUser = user['username'];
                this.currentUser = user;
                this.ngRedux.dispatch(updateStatus(this.loggedInUser, 'online'));

            }
        });

        this.chatPanelService.getToken({email: this.loggedInUser, clientType: 'sample-client'})
        .subscribe(async (response) => {
            this.userCredentials = response;
            this.ngRedux.dispatch(setUserCredentials(this.userCredentials));
            localStorage.setItem('chatToken', response.token);
            await this.getUser();
            this.makeSocketConnection();

            Notification.requestPermission()
                .then(perm => {
                    this.isNotificationAllowed = perm === 'granted';
                    this.chatPanelService.disableNotification.next(
                        { 
                            enableNotification: this.isNotificationAllowed 
                        });
                });            
        });

        this.chatPanelService.disableNotification.subscribe(({ enableNotification }) => {
            this.isNotificationAllowed = enableNotification;
        });

        // Get contacts from store and display them
        this.contacts$.subscribe(stateContacts => {
           this.allContacts = stateContacts;
            this.contactsWithoutGroups = stateContacts ? stateContacts.filter(contact => !contact.groupId) : [];
        });

        this.chatPanelLocation$.subscribe(location => {
            this.chatPanelLocation = location;
            if ( this.chatConnection === AllEnums.MAIN_CHAT_PANEL) {
                this.closeChatBar();
            }
        });

        this.chatPanelService.selectecdContactFromModal.subscribe( async ({ selectedContact, openSideBar }) => {
            this.openSideBar = openSideBar;
           await this.forwardChat(selectedContact);
           this.selectedMessages = [];
           this.selectedIndexes = [];
           
        });
        this.chatPanelService.newAdmin.subscribe( async ({ selectedAdmin, selectedGroupId }) => {
          this.chatHelperService.addNewGroupAdmin(selectedAdmin, selectedGroupId, this);
           
        });

        this.chatPanelService.selectecdFileType.subscribe(() => {
           this.chatHelperService.exportChat(this);
            
        });

    }

    ngAfterViewInit(): void
    {
        this.chatViewScrollbar = this.fusePerfectScrollbarDirectives.find((directive) => {
            return directive.elementRef.nativeElement.id === 'messages';
        });
    }

    getUser = () => {
        this.chatPanelService.getUser(this.loggedInUser)
        .toPromise()
        .then(res => {
            const { data } = res;
            data.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
            this.ngRedux.dispatch(setCurrentUser(data));
        }).catch(error => console.log(error));
    }

     /**
     * Socket connection made here
     *
     */
    makeSocketConnection = async() => {
        const { connection } = this.chatHelperService.makeSocketConnection(this.userCredentials.token);
        const connectionInstance = connection();
        const {
            privateMessage,
            groupMessage,
            newGroupUpdate, 
            onStatusUpdateCompleted,
            exitGroup,
            senderPrivateNotification,
            onMoodUpdateCompleted } = this.chatHelperService.socketConnections(this);
       
            // Private Message
        connectionInstance.on('privateMessage', msg => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                privateMessage(msg);
            } 
        });

        // Update sender
        connectionInstance.on('senderPrivateNotification', msg => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                senderPrivateNotification(msg);
            } 
        });

        // Group Message
        connectionInstance.on('groupMessage', msg => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                groupMessage(msg);
            } 
        });

        // newGroupUpdate
        connectionInstance.on('newGroupUpdate', newGroup => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                newGroupUpdate(newGroup);
            } 
        });

        connectionInstance.on('updateStatus', (username, status) => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                onStatusUpdateCompleted(username, status);
            } 
        });

        connectionInstance.on('updateMood', (username, mood) => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                onMoodUpdateCompleted(username, mood);
            } 
        });

        connectionInstance.on('removeOrExitGroup', msg => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                const title = `${msg.username} is left the group`;
                const notificationTitle = 'Group exit';
                const notificationOptions = {
                        body: `${title} from ${name}`,
                        icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
                        };
                this.chatHelperService.composeAndSendNotification(notificationOptions, notificationTitle, this);
            }
        });

        connectionInstance.on('groupExit', groupId => {
            const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
            if (chatPanelLocation === AllEnums.SIDE_CHAT_PANEL) {
                exitGroup(groupId);
            }
        });

        connectionInstance.start().then(() => {
            this.chatConnection = connectionInstance;
            this.ngRedux.dispatch(saveConnection(connectionInstance));

            localStorage.setItem('connection', connectionInstance);

            this.chatPanelService.fetchContacts().subscribe(({ data }) => {
                this.chatHelperService.mergeGroupsAndContacts(data, this);
            });

            this.chatPanelService.shareConnection.subscribe(({}) => {
                this.chatPanelService.connection.next({ connectionInstance });
            });
        })
        .catch(() => {
            this.matSnackBar.open('could not connect to the server');
        });
        
    }

    /**********************************************************/
    /************Handles group features************************/
    /****************************8*****************************/
    /**
     * Create a new group
     *
     */
    createGroup = (form: NgForm) => {        
      this.chatHelperService.createGroup(form, this);
    }

     /**
     * Adds a new group
     *f
     */
    addNewGroup = () => {
        this.messagesList = [];
        this.setPlaceHolderVisibility('Create a group', true);
        return this.chatHelperService.resetScreenForCreateGroupChat(this);
     }
 
 
      /**
      * Adds a user to a group
      *
      */
     addUserToGroup = (user) => {
        this.chatHelperService.addUserToGroup(user, this);
     }
 

     clearChat = () => {
         this.chatHelperService.clearChat(this);
     }


     addNewGroupAdmin = () => {
        this.matDialog.open(ChatModalComponent, {
            width: '60%',
            data: { isAddingAdmin: true, allContacts: this.contactsWithoutGroups, selectedGroupId: this.selectedUser.groupId },
        });
    }

    /**
     *  Delete group
     *
    */

    deleteGroup = () => {
        this.chatHelperService.deleteGroup(this);
    }

    exitGroup = () => {
    this.chatHelperService.exitGroup(
            this,
            this.selectedUser.groupId,
            this.loggedInUser
            );
    }

     /*
     * @memberof ChatPanelComponent
     */
    openChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').unfoldTemporarily();
      
    }

    getMediaExt = (fileName) => {
        return this.chatHelperService.getMediaExt(fileName);
    }

    /**
     * Select a chat partner
     *
     */
    selectChatPartner = (user): any => {
        this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.SIDE_CHAT_PANEL }));
        this.chatHelperService.selectChatPartner(user, this);
        this.prepareChatForReplies();

    }


     /**
     * Load more chats on screen scroll
     *
     */
    loadMoreMessagesOnScroll = (event): any => {
        this.chatHelperService.loadMoreMessagesOnScroll(event, this);
    }

    
    /************************************************************/
    /************Handles messages sendung************************/
    /************************************************************/

    updateScreenMessages = () => {
       this.chatHelperService.updateScreenMessages(this);
    }

    dispatchUpdateMessage = (userId, modifiedMessages, messageFromScroll = false) => {
        this.chatHelperService.dispatchUpdateMessage(
            userId,
            modifiedMessages.reverse(), 
            this,
            messageFromScroll
            );
    }
    /**
     * Send private message
     *
     */
    sendMessage = async(form: NgForm) => {
       await this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.SIDE_CHAT_PANEL }));
        this.chatHelperService.sendMessage(form, this);
        this.prepareChatForReplies();
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
      * Block a contact
      *
      */
     blockContact = (): void => {
       this.chatHelperService.blockContact(this);
      }

      
 
     /**
      * Send file in chat
      *
      */
     sendFile = (event): any => {
       this.chatHelperService.sendFile(event, this);
     
     }
 
      enableInputSelector = (showInputSelector, showReplyForm, action = '') => {
        this.chatHelperService.enableInputSelector(showInputSelector, showReplyForm, this);
      }

      setActionTextValue = (text) => {
        if (text === 'deleteMessage') {
            this.actionText = 'Delete';
        } 
        
        if (text === 'forwardMessage') {
            this.actionText = 'Forward';
        }
      }
 
      cancelChatSelection = () => {
        this.chatHelperService.cancelChatSelection(this);
      }
 
      forwardChat = (selectedContact) => {
          this.selectedUser = selectedContact;
         this.chatHelperService.forwardChat(selectedContact, this);
      }
 
      deleteMessages = () => {
         this.chatHelperService.deleteMessages(this);
      }
 
      openChatModal = () => {
          const dialog = this.matDialog.open(ChatModalComponent, {
             width: '40%',
             data: { 
                 message: 'Select a contact', 
                 allContacts: this.allContacts,
                 location: 'chat-panel'
                }
          });
 
          dialog.afterClosed().subscribe(selectedData => {
           
        });
      }
 
      // This gets selected messages to be forwarded or deleted or exported
      getSelectedMessages = (message, index): any => {
         this.chatHelperService.getSelectedMessages(message, index, this);
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
 
      setPlaceHolderVisibility = (msg, condition) => {
         this.chatHelperService.setPlaceHolderVisibility(msg, condition, this);
      }
 
      showMessageActionsHandler = (condition, index): void => {
          this.messagesList[index]['showMessageActions'] = condition;
      }
 
      sanitizeAndRedirect = (url) => {
         const anchorElement = document.createElement('a');
         const sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
         anchorElement.setAttribute('href', sanitizedUrl['changingThisBreaksApplicationSecurity']);
         anchorElement.setAttribute('target', '_blank');
         anchorElement.click();
     }
     

    /**
     * Close chat bar on click
     *
     */
    closeChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').foldTemporarily();
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
    resetChatScreen = () => {
       this.chatHelperService.resetChatScreen(this);
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
     * Prepare the chat for the replies
     */
     prepareChatForReplies = (): void =>
    {
        setTimeout(() => {

            // Focus to the reply input
            // this._replyInput.nativeElement.focus();

            // Scroll to the bottom of the messages list
            if ( this.chatViewScrollbar )
            {
                this.chatViewScrollbar.update();

                setTimeout(() => {
                    this.chatViewScrollbar.scrollToBottom(0);
                });
            }
        });
    }
}
