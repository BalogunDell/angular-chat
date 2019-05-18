import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
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
    setUserCredentials, setCurrentUser
} from '../../../redux/actions';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { AllEnums } from 'app/enums';

@Component({
    selector     : 'chat-panel',
    templateUrl  : './chat-panel.component.html',
    styleUrls    : ['./chat-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})


export class ChatPanelComponent implements OnInit
{
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
    audioExt = ['mp3', 'wma', 'ogg'];
    files = ['pdf', 'doc', 'txt', 'docx', 'csv'];
    allExt = [ ...this.imageExt, ...this.audioExt, ...this.files ];
    showInputSelector = false;
    selectedMessages = [];
    selectedIndexes = [];
    actionText = '';
    currentUser = null;
    chatPanelLocation = null;
    openSideBar = true;

    @ViewChild(FusePerfectScrollbarDirective)
    directiveScroll: FusePerfectScrollbarDirective;

    @select(['contacts']) contacts$: Observable<[]>;
    @select('currentUser') currentUser$: Observable<any[]>;
    @select('chatPanelLocation') chatPanelLocation$: Observable<any[]>;

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
        this.currentUser$.subscribe(user => {
            if (user) {
                this.loggedInUser = user['username'];
                this.currentUser = user;
            }
        });
        this.chatPanelService.getToken({email: this.loggedInUser})
        .subscribe(async (response) => {
            this.userCredentials = response;
            this.ngRedux.dispatch(setUserCredentials(this.userCredentials));
            localStorage.setItem('chatToken', response.token);
            await this.getUser(response.token);
            this.makeSocketConnection();
            this.isNotificationAllowed = this.chatPanelService.requestChatNotificationPermission();
        });

        // Get contacts from store and display them
        this.contacts$.subscribe(stateContacts => {
            this.allContacts = stateContacts;
            console.log(stateContacts, 'data');
        });

        this.chatPanelLocation$.subscribe(location => {
            this.chatPanelLocation = location;
        });

        this.chatPanelService.selectecdContactFromModal.subscribe( async ({ selectedContact, openSideBar }) => {
            this.openSideBar = openSideBar;
            console.log(openSideBar);
           await this.selectChatPartner(selectedContact);
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

    getUser = (token) => {
        this.chatPanelService.getUser(this.loggedInUser, token)
        .toPromise()
        .then(res => {
            const { data } = res;
            data.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
            this.ngRedux.dispatch(setCurrentUser(data));
        }).catch(error => console.log(error));
    }

     
    // } 

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
            onMoodUpdateCompleted } = this.chatHelperService.socketConnections(this.userCredentials.token, this);

        // Private Message
        connectionInstance.on('privateMessage', msg => {
            privateMessage(msg);
        });

        // Group Message
        connectionInstance.on('groupMessage', msg => {
            groupMessage(msg);
        });

        // newGroupUpdate
        connectionInstance.on('newGroupUpdate', newGroup => {
            newGroupUpdate(newGroup);
        });

        connectionInstance.on('UpdateStatus', (username, status) => {
            onStatusUpdateCompleted(username, status);
        });

        connectionInstance.on('UpdateMood', (username, mood) => {
            onMoodUpdateCompleted(username, mood);
        });
        connectionInstance.start();
        this.chatConnection = connectionInstance;
        this.chatPanelService.chatConnection.next(connectionInstance);
        this.chatHelperService.mergeGroupsAndContacts(this.userCredentials.token, this);
        
    }

    /**********************************************************/
    /************Handles group features************************/
    /****************************8*****************************/
    /**
     * Create a new group
     *
     */
    createGroup = (form: NgForm) => {        
      this.chatHelperService.createGroup(this.userCredentials.token, form, this);
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
 

    /**
     *  Delete group
     *
    */

    deleteGroup = () => {
        this.chatHelperService.deleteGroup(this);
    }

     /*
     * @memberof ChatPanelComponent
     */
    openChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').unfoldTemporarily();
       if (!this.selectedUser) {
       }
    }

    /**
     * Select a chat partner
     *
     */
    selectChatPartner = (user): any => {
        if (this.openSideBar) {
           return this.chatHelperService.selectChatPartner(user, this, true);
        }
        return this.chatHelperService.selectChatPartner(user, this, false);
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
    sendMessage(form: NgForm): void {
        this.chatHelperService.sendMessage(form, this);
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
         this.chatHelperService.forwardChat(selectedContact, this);
      }
 
      deleteMessages = () => {
         this.chatHelperService.deleteMessages(this.userCredentials.token, this);
      }
 
      openChatModal = () => {
          const dialog = this.matDialog.open(ChatModalComponent, {
             width: '50%',
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
         // const parentElement = document.getElementById('showFile');
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
     * Scroll to the bottom
     *
     * @param {number} speed
     */
    scrollToBottom(speed?: number): void
    {
        speed = speed || 400;
        if ( this.directiveScroll )
        {
            this.directiveScroll.update();

            setTimeout(() => {
                this.directiveScroll.scrollToBottom(0, speed);
            });
        }
    }
}
