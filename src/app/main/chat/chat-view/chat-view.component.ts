import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, Observable } from 'rxjs';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';

import { AppStateI } from 'app/interfaces';
import { NgRedux, select } from '@angular-redux/store';
import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { ChatModalComponent } from 'app/layout/components/chat-panel/chat-units/chat-modal/chat-modal.component';
import { AllEnums } from 'app/enums';
import { setChatLocation } from 'app/redux/actions';

@Component({
    selector     : 'chat-view',
    templateUrl  : './chat-view.component.html',
    styleUrls    : ['./chat-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatViewComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
    user: any;
    chat: any;
    messagesList = [];
    chatConnection = null;
    selectedContactId = null;
    loggedInUser = null;
    userId = null;
    replyInput: any;
    isNotificationAllowed;
    imageExt = ['jpg', 'png', 'jpeg', 'gif'];
    audioExt = ['mp3', 'wma', 'ogg', 'mp4', 'mkv'];
    files = ['pdf', 'doc', 'txt', 'docx', 'csv', 'swf', 'txt'];
    allExt = [ ...this.imageExt, ...this.audioExt, ...this.files ];
    showCreateGroupForm = false;
    showPlaceHolderIconAndText = false;
    showReplyForm = true;
    actionText = null;
    showInputSelector = false;
    selectedMessages = [];
    selectedIndexes = [];
    selectedContact = null;
    contactsWithoutGroups = [];
    placeholderMessage = '';
    selectContact;
    
    page = 1;
    pageLimit = 20;

    @ViewChild(FusePerfectScrollbarDirective)
    directiveScroll: FusePerfectScrollbarDirective;

    @ViewChildren('replyInput')
    replyInputField;

    @ViewChild('replyForm')
    replyForm: NgForm;

    @select(['userCredentials']) userCredentials$: Observable<any>;
    userCredentials;

    @select(['contacts']) allContacts$: Observable<any>;
    allContacts;

    @select('currentUser') currentUser$: Observable<any[]>;

    @Input() selectedUser;


    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private matDialog: MatDialog,
        private chatHelperService: ChatHelperService,
        public ngRedux: NgRedux<AppStateI>,
        private chatPanelService: ChatPanelService,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.currentUser$.subscribe(user => {
            this.user = user;
            this.loggedInUser = user['username'];
        });

        this.userCredentials$.subscribe(userCredentials => {
            this.userCredentials = userCredentials;
            this.userId = userCredentials.userId;
          });

        // this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.MAIN_CHAT_PANEL }));
        this.allContacts$.subscribe(allContacts => {
            this.allContacts = allContacts;
            this.contactsWithoutGroups = allContacts.filter(contact => !contact.groupId);
        });

        const state = this.ngRedux.getState();
        this.chatConnection = state['connection'];

        this.chatPanelService.disableNotification.subscribe(({ enableNotification }) => {
            this.isNotificationAllowed = enableNotification;
        });

        this.makeSocketConnection();
        Notification.requestPermission()
        .then(perm => {
            this.isNotificationAllowed = perm === 'granted';
            this.chatPanelService.disableNotification.next({ enableNotification: this.isNotificationAllowed });
        });
        this.chatPanelService.selectecdContactFromModal.subscribe( async ({ selectedContact }) => {
        this.forwardChat(selectedContact);
        this.selectedMessages = [];
        this.selectedIndexes = [];
        
        });

        this.chatPanelService.selectecdFileType.subscribe(() => {
            this.chatHelperService.exportChat(this);
             
         });

         this.chatPanelService.newAdmin.subscribe( async ({ selectedAdmin, selectedGroupId }) => {
            this.chatHelperService.addNewGroupAdmin(selectedAdmin, selectedGroupId, this);
             
          });
}

     /**
     * Socket connection made here
     *
     */
    makeSocketConnection = () => {
        
        const chatPanelLocation = this.ngRedux.getState()['chatPanelLocation'];
        
           const {
               privateMessage,
               groupMessage,
               senderPrivateNotification,
               exitGroup,
               newGroupUpdate } = this.chatHelperService.socketConnections(this);
   
           // Private Message
           this.chatConnection.on('privateMessage', msg => {
            if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
                privateMessage(msg);
            } 
            this.readyToReply();
           });
   
           // Update sender
           this.chatConnection.on('senderPrivateNotification', msg => {
               if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
                senderPrivateNotification(msg);
            } 
               this.readyToReply();
           });
   
           // Group Message
           this.chatConnection.on('groupMessage', msg => {
            if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
                groupMessage(msg);
            } 
              
           });
   
           // newGroupUpdate
           this.chatConnection.on('newGroupUpdate', newGroup => {
            if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
                newGroupUpdate(newGroup);
            } 
           });
   
           this.chatConnection.on('removeOrExitGroup', msg => {
            if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
            } 
               
           });
   
           this.chatConnection.on('groupExit', groupId => {
            if (chatPanelLocation === AllEnums.MAIN_CHAT_PANEL) {
                exitGroup(groupId);
            } 
               
           });
    }

    ngOnChanges(change: SimpleChanges): void
    {
        const { currentValue: { messages, id, groupId } } = change.selectedUser;
        this.messagesList = messages;
        this.selectedContactId = id ? id : groupId;
        this.readyToReply();
        const { previousValue } = change.selectedUser;
        const previousId = previousValue && (previousValue.id || previousValue);
       if (this.selectedContactId !== previousId) {
           this.showCreateGroupForm = false;
           this.showReplyForm = true;
       }

    }

    cancelGroupCreation = () => {
        this.showCreateGroupForm = false;
        this.showReplyForm = true;
    }


    updateScreenMessages = () => {
        this.chatHelperService.updateScreenMessages(this);
     }
 
     dispatchUpdateMessage = (userId, modifiedMessages, messageFromScroll = false) => {
         this.chatHelperService.dispatchUpdateMessage(
             userId,
             modifiedMessages,
             this,
             messageFromScroll
             );
     }

    sendMessage = (form: NgForm) => {
        this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.MAIN_CHAT_PANEL }));
        this.chatHelperService.sendMessage(form, this);
        this.readyToReply();
    }

    /**
     * Send file in chat
     *
     */
    attachFile = (): void => {
        const inputElement = document.getElementById('chatFile');
        inputElement.click();
     }

     getMediaExt = (fileName) => {
        return this.chatHelperService.getMediaExt(fileName);
    }


     resetChatScreen = () => {
        this.chatHelperService.resetChatScreen(this);
    }

    forwardChat = (selectedContact) => {
        this.chatHelperService.forwardChat(selectedContact, this);
     }

     exportChat = (): void => {
        this.matDialog.open(ChatModalComponent, {
            width: '40%',
           data: { isExportingChat: true }
        });
     }

    /**
     * Send file in chat
     *
     */
     sendFile = (event): any => {
        this.chatHelperService.sendFile(event, this);
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

     deleteGroup = () => {
        this.chatHelperService.deleteGroup(this);
    }

    createGroup = (form: NgForm) => {        
        this.chatHelperService.createGroup(form, this);
      }

    exitGroup = () => {
    this.chatHelperService.exitGroup(
            this,
            this.selectedUser.groupId,
            this.loggedInUser
            );
    }

    clearChat = () => {
        this.chatHelperService.clearChat(this);
    }


     setPlaceHolderVisibility = (msg, condition) => {
        this.chatHelperService.setPlaceHolderVisibility(msg, condition, this);
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

    // This gets selected messages to be forwarded or deleted or exported
    getSelectedMessages = (message, index): any => {
        this.chatHelperService.getSelectedMessages(message, index, this);
     }

    deleteMessages = () => {
         this.chatHelperService.deleteMessages(this);
      }

    openChatModal = () => {
    const dialog = this.matDialog.open(ChatModalComponent, {
        width: '50%',
        data: { 
            message: 'Select a contact', 
            allContacts: this.allContacts,
            location: 'chat-view'
            }
        });

        dialog.afterClosed().subscribe(selectedData => {
        this.chatPanelService.selectecdContactFromModal.next({
            selectedContact: this.selectedContact,
            openSideBar: false });
        });
    }

    blockContact = (): void => {
        this.chatHelperService.blockContact(this);
       }

    cancelChatSelection = () => {
        this.chatHelperService.cancelChatSelection(this);
      }

      addNewGroupAdmin = () => {
        this.matDialog.open(ChatModalComponent, {
            width: '60%',
            data: { isAddingAdmin: true, allContacts: this.contactsWithoutGroups,  selectedGroupId: this.selectedUser.groupId },
        });
      }


    /**
     * Load more chats on screen scroll
     *
     */
    loadMoreMessagesOnScroll = (event): any => {
        this.chatHelperService.loadMoreMessagesOnScroll(event, this);
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.ngRedux.dispatch(setChatLocation({ chatLocation: AllEnums.SIDE_CHAT_PANEL }));
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
     * Ready to reply
     */
    readyToReply(): void
    {
        setTimeout(() => {
            this.focusReplyInput();
            this.scrollToBottom();
        });
    }

    /**
     * Focus to the reply input
     */
    focusReplyInput(): void
    {
        setTimeout(() => {
            this.replyInput.focus();
        });
    }

    /**
     * Scroll to the bottom
     *
     * 
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
