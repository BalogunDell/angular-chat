import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';

import { ChatService } from 'app/main/chat/chat.service';
import { AppStateI } from 'app/interfaces';
import { NgRedux, select } from '@angular-redux/store';
import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';
import { MatDialog } from '@angular/material';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { ChatModalComponent } from 'app/layout/components/chat-panel/chat-units/chat-modal/chat-modal.component';

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
    isNotificationAllowed = false;
    imageExt = ['jpg', 'png', 'jpeg', 'gif'];
    audioExt = ['mp3', 'wma', 'ogg'];
    files = ['pdf', 'doc', 'txt', 'docx', 'csv'];
    allExt = [ ...this.imageExt, ...this.audioExt, ...this.files ];
    showCreateGroupForm = false;
    showReplyForm = true;

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

    @Input()
    selectedUser;


    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService,
        private matDialog: MatDialog,
        private chatHelperService: ChatHelperService,
        private ngRedux: NgRedux<AppStateI>,
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
        this.loggedInUser = localStorage.getItem('currentUser');
        this.user = this._chatService.user;
        this.userCredentials$.subscribe(userCredentials => {
            this.userCredentials = userCredentials;
            this.userId = userCredentials.userId;
          });

        this.allContacts$.subscribe(allContacts => {
            this.allContacts = allContacts;
        });
          this.makeSocketConnection();
          this.isNotificationAllowed = this.chatPanelService.requestChatNotificationPermission();
    }

     /**
     * Socket connection made here
     *
     */
    makeSocketConnection = () => {
        const { connection } = this.chatHelperService.makeSocketConnection(this.userCredentials.token);
        const connectionInstance = connection();
      
        const {
            privateMessage,
            groupMessage,
            newGroupUpdate } = this.chatHelperService.socketConnections(this.userCredentials.token, this);

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
        connectionInstance.start();
        this.chatConnection = connectionInstance;
    }

    ngOnChanges(change: SimpleChanges): void
    {
        const { currentValue: { messages, id, groupId } } = change.selectedUser;
        this.messagesList = messages;
        this.selectedContactId = id ? id : groupId;
        this.readyToReply();

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


     resetChatScreen = () => {
        this.chatHelperService.resetChatScreen(this);
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

     createGroup = (form: NgForm) => {        
        this.chatHelperService.createGroup(this.userCredentials.token, form, this);
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Decide whether to show or not the contact's avatar in the message row
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    shouldShowContactAvatar(message, i): boolean
    {
        return (
            message.who === this.selectedUser.id &&
            ((this.messagesList[i + 1] && this.messagesList[i + 1].who !== this.messagesList[i]['id']) || !this.messagesList[i + 1])
        );
    }

    /**
     * Check if the given message is the first message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isFirstMessageOfGroup(message, i): boolean
    {
        return (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].who !== message.who);
    }

    /**
     * Check if the given message is the last message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isLastMessageOfGroup(message, i): boolean
    {
        return (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].who !== message.who);
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

    /**
     * Reply
     */
    reply(event): void
    {
        event.preventDefault();

        if ( !this.replyForm.form.value.message )
        {
            return;
        }

        // Message
        const message = {
            who    : this.user.id,
            message: this.replyForm.form.value.message,
            time   : new Date().toISOString()
        };

        // Add the message to the chat
        this.messagesList.push(message);

        // Reset the reply form
        this.replyForm.reset();

        // Update the server
        this._chatService.updateDialog(this.selectedUser.chatId, this.messagesList).then(response => {
            this.readyToReply();
        });
    }
}
