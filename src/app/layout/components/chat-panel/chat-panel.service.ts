import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { FuseUtils } from '@fuse/utils';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
@Injectable()
export class ChatPanelService
{
    contacts: any[];
    chats: any[];
    user: any;
    chatUrls = [ {
        generateToken: 'http://localhost:5000/api/users/generateToken',
        contactList: 'http://localhost:5000/api/users/contactList',
        privateChatHistory: 'http://localhost:5000/api/messages/getPrivateMessages?',
        }
    ];
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
    }

    

    /* get user token and id => This call should be 
    taken out as soon as the chat is connected to the real dbase
    */

    getToken(userEmail): Observable<any> {
        return this._httpClient.post(this.chatUrls[0].generateToken, userEmail)
        .pipe(map((response: Response) => response));
    }


    formatChatTime(timeSent): any {
        const splitTime = timeSent.split('T');
        const dateSent = splitTime[0].split('-');
        const formattedDate = `${dateSent[2]}/${dateSent[1]}/${dateSent[0].substring(2, dateSent[0].length)}`;
        const readableTimeSent =  splitTime[1].split('.')[0];
        const chatTime = readableTimeSent.substring(0, readableTimeSent.length - 3).split(':');
        const hours = parseInt(chatTime[0], 10);
        const minutes = parseInt(chatTime[1], 10);
        let hoursInPM = 0;
        let formattedTime = '';

        if (hours > 12) {
            hoursInPM = hours - 12;
            formattedTime = `0${hoursInPM}:${minutes} PM`;
        } else if (hours < 12) {
            formattedTime = `${hours}:${minutes} AM`;
        } else {
            formattedTime = `${hours}:${minutes} PM`;
        }
        return `${formattedDate}, ${formattedTime }`;

    }

    fetchContacts(token): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };

        return this._httpClient.get(this.chatUrls[0].contactList, httpOptions)
        .pipe(map((response: Response) => response));
    }


    fetchPrivateChatHistory(token, recipientUsername, page): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.get(`${this.chatUrls[0].privateChatHistory}recipientUsername=${recipientUsername}&page=${page}&pagesize=4`, httpOptions)
        .pipe(map((response: Response) => response));
    }

    sendChatFile(file): any {
        console.log(file);
    }

    requestChatNotificationPermission(): any {
       return Notification.requestPermission()
        .then(perm => {
            console.log(perm);
            if (perm === 'granted') {
               return true;
            }
            return false;
        });
    }

    sendChatNotification(title, options): any {
        const notification = new Notification(title, options);
        const notificationsound = new Audio('assets/sounds/unsure.mp3');
        notificationsound.play(); 
        return notification;
    }


    /**
     * Loader
     *
     * @returns {Promise<any> | any}
     */
    // loadContacts(): Promise<any> | any
    // {
    //     return new Promise((resolve, reject) => {
    //         Promise.all([
    //             this.getContacts(),
    //             this.getUser()
    //         ]).then(
    //             ([contacts, user]) => {
    //                 this.contacts = contacts;
    //                 this.user = user;
    //                 resolve();
    //             },
    //             reject
    //         );
    //     });
    // }

    /**
     * Get chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    // getChat(contactId): Promise<any>
    // {
    //     const chatItem = this.user.chatList.find((item) => {
    //         return item.contactId === contactId;
    //     });

    //     // Get the chat
    //     return new Promise((resolve, reject) => {

    //         // If there is a chat with this user, return that.
    //         if ( chatItem )
    //         {
    //             this._httpClient.get('api/chat-panel-chats/' + chatItem.chatId)
    //                 .subscribe((chat) => {

    //                     // Resolve the promise
    //                     resolve(chat);

    //                 }, reject);
    //         }
    //         // If there is no chat with this user, create one...
    //         else
    //         {
    //             this.createNewChat(contactId).then(() => {

    //                 // and then recall the getChat method
    //                 this.getChat(contactId).then((chat) => {
    //                     resolve(chat);
    //                 });
    //             });
    //         }
    //     });
    // }

    /**
     * Create new chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    // createNewChat(contactId): Promise<any>
    // {
    //     return new Promise((resolve, reject) => {

    //         // Generate a new id
    //         const chatId = FuseUtils.generateGUID();

    //         // Prepare the chat object
    //         const chat = {
    //             id    : chatId,
    //             dialog: []
    //         };

    //         // Prepare the chat list entry
    //         const chatListItem = {
    //             chatId         : chatId,
    //             contactId      : contactId,
    //             lastMessageTime: '2017-02-18T10:30:18.931Z'
    //         };

    //         // Add new chat list item to the user's chat list
    //         this.user.chatList.push(chatListItem);

    //         // Post the created chat to the server
    //         this._httpClient.post('api/chat-panel-chats', {...chat})
    //             .subscribe(() => {

    //                 // Post the updated user data to the server
    //                 this._httpClient.post('api/chat-panel-user/' + this.user.id, this.user)
    //                     .subscribe(() => {

    //                         // Resolve the promise
    //                         resolve();
    //                     });
    //             }, reject);
    //     });
    // }

    /**
     * Update the chat
     *
     * @param chatId
     * @param dialog
     * @returns {Promise<any>}
     */
    // updateChat(chatId, dialog): Promise<any>
    // {
    //     return new Promise((resolve, reject) => {

    //         const newData = {
    //             id    : chatId,
    //             dialog: dialog
    //         };

    //         this._httpClient.post('api/chat-panel-chats/' + chatId, newData)
    //             .subscribe(updatedChat => {
    //                 resolve(updatedChat);
    //             }, reject);
    //     });
    // }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    // getContacts(): Promise<any>
    // {
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get('api/chat-panel-contacts')
    //             .subscribe((response: any) => {
    //                 resolve(response);
    //             }, reject);
    //     });
    // }

    /**
     * Get user
     *
     * @returns {Promise<any>}
     */
    // getUser(): Promise<any>
    // {
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get('api/chat-panel-user')
    //             .subscribe((response: any) => {
    //                 resolve(response[0]);
    //             }, reject);
    //     });
    // }
}
