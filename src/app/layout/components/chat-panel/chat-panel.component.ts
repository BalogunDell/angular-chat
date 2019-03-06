import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import * as moment from 'moment';
@Component({
    selector     : 'chat-panel',
    templateUrl  : './chat-panel.component.html',
    styleUrls    : ['./chat-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})


export class ChatPanelComponent implements OnInit
{
    allContacts: any[];
    selectedUser = null;
    sidebarFolded: boolean;
    userCredentials = null;
    chatConnection = null;
    messagesList = [];
    loggedInUser = null;
    showMessage = true;
    isNotificationAllowed = false;
    page = 1;
    
    @ViewChild('container') private messageContainer: ElementRef;

    // @ViewChild('replyForm')
    // set replyForm(content: NgForm)
    // {
    //     this._replyForm = content;
    // }

    // @ViewChild('replyInput')
    // set replyInput(content: ElementRef)
    // {
    //     this._replyInput = content;
    // }

    // @ViewChildren(FusePerfectScrollbarDirective)
    // private _fusePerfectScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;

    // Private
    // private _chatViewScrollbar: FusePerfectScrollbarDirective;
    // private _replyForm: NgForm;
    // private _replyInput: ElementRef;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatPanelService} _chatPanelService
     * @param {HttpClient} _httpClient
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private chatPanelService: ChatPanelService,
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
            this.makeSocketConnection();
             this.isNotificationAllowed = this.chatPanelService.requestChatNotificationPermission();
        });
    }

     
    // } 

     /**
     * Socket connection made here
     *
     */
    makeSocketConnection = (): void => {
        const signalR  = require('@aspnet/signalr');
        // const signalRMsgPack = require('@aspnet/signalr-protocol-msgpack');
             const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/chatHub', { 
                accessTokenFactory: () => this.userCredentials.token
            })
            // .withHubProtocol( new signalR.protocols.msgpack.MessagePackHubProtocol())
            .build();
            connection.on('privateMessage', msg => {
                const { content, timeSent, senderId } = msg;
                const chatTime = this.chatPanelService.formatChatTime(timeSent);
                const message = { content, chatTime, senderId };
                const contentHolderId = document.getElementById('container');
                contentHolderId.scrollTop = contentHolderId.offsetHeight;
                this.messagesList.push(message);
                if (this.isNotificationAllowed) {
                    const notificationTitle = 'New message';
                    const notificationOptions = {
                        body: message.content,
                        icon: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
                    };
                    this.chatPanelService.sendChatNotification(notificationTitle, notificationOptions);
                }
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
            });
    }

     /**
     * Fetch private messages history
     *
     */

    fetchPrivateChatHistory = (token, recipientUserName) => {
        return this.chatPanelService.fetchPrivateChatHistory(token, recipientUserName, this.page)
            .subscribe(response => {
                const {message} = response;
                message.map(msg => {
                    msg['chatTime'] = this.chatPanelService.formatChatTime(msg.timeSent);
                });
                this.messagesList = message.reverse();
            });
    }


     /**
     * Open chat panen on click
     *
     */
    openChatBar(): void {
        this._fuseSidebarService.getSidebar('chatPanel').unfoldTemporarily();
    }

     /**
     * Select a chat partner
     *
     */
    selectChatPartner(user): void {
        this.openChatBar();
        this.messagesList = [];
        this.selectedUser = user;
        console.log(this.selectedUser);
        this.chatPanelService.requestChatNotificationPermission();
        this.fetchPrivateChatHistory(this.userCredentials.token, this.selectedUser.username);
    }

     /**
     * Load more chats on screen scroll
     *
     */
    loadMoreMessagesOnScroll = (event): any => {
        const currentPosition = event.target.scrollTop;
        console.log(currentPosition);
        console.log(event.target.scrollHeight, 'height');
        if (currentPosition === 0) {
            this.page += 1;
            return this.chatPanelService.fetchPrivateChatHistory(this.userCredentials.token, this.selectedUser.username, this.page)
            .subscribe(response => {
                const {message} = response;
                message.map(msg => {
                    msg['chatTime'] = this.chatPanelService.formatChatTime(msg.timeSent);
                });
                const currentMessageList = this.messagesList;
                this.messagesList = message.reverse().concat(currentMessageList);
                console.log(this.messagesList);
                const contentHolderId = document.getElementById('container');
                const scrollHeight = contentHolderId.scrollHeight;
                console.log(scrollHeight);
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
        const messagePaylod = {
            senderId: this.userCredentials.userId,
            senderUsername:  this.loggedInUser,
            content: message
        };
        this.chatConnection.invoke('SendPrivateMessage', username, messagePaylod);
        messagePaylod['chatTime'] = this.chatPanelService.formatChatTime(moment().format());
        this.messagesList.push(messagePaylod);
        form.reset();
        this.scrollChatScreenUp();
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
     * Scroll chat screen up
     *
     */
    scrollChatScreenUp = (): void => {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
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
    sendFile = (event): void => {
       const file = event.target.files[0];
       const fileName = file.name;
       const fileExtension = fileName.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
       const imageExt = ['jpg', 'png', 'jpeg', 'gif'];


       if (imageExt.includes(fileExtension)) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (ev) => {
            const messagePaylod = {
                senderId: this.userCredentials.userId,
                senderUsername:  this.loggedInUser,
                content: ev.target['result'],
                image: true,
            };
            messagePaylod['chatTime'] = this.chatPanelService.formatChatTime(moment().format());
            this.messagesList.push(messagePaylod);
            const { username } = this.selectedUser;
            this.chatConnection.invoke('SendPrivateMessage', username, messagePaylod);
        };
           
       }
     }
}
