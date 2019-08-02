import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { FuseUtils } from '@fuse/utils';
import { Response } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import { EventEmitter } from 'protractor';
@Injectable()
export class ChatPanelService
{
    contacts: any[];
    selectecdContactFromModal = new Subject();
    selectecdFileType = new Subject();
    newAdmin = new Subject();
    chatConnection = new Subject();
    disableNotification = new Subject();
    connection = new Subject();
    shareConnection = new Subject();
    chats: any[];
    user: any;
    chatUrls = [ {
        generateToken: 'http://localhost:5000/api/users/generateToken',
        contactList: 'http://localhost:5000/api/users/contactList',
        privateChatHistory: 'http://localhost:5000/api/messages/getPrivateMessages?',
        groupChatHistory: 'http://localhost:5000/api/messages/getGroupMessages?',
        groupUrl: 'http://localhost:5000/api/groups',
        addUserToGroup: 'http://localhost:5000/api/users/addUserToGroup',
        sendFile: 'http://localhost:5000/api/messages/uploadFile',
        getFile: 'http://localhost:5000/api/messages/GetMediaMessage?messageId',
        getUser: 'http://localhost:5000/api/users?username=',
        deletePrivateMessage: 'http://localhost:5000/api/messages/deleteMessage',
        deleteGroupMessage: 'http://localhost:5000/api/messages/deleteGroupMessage',
        exitGroup: 'http://localhost:5000/api/users/exitGroup',
        blockContact: 'http://localhost:5000/api/users/blockContact'
        }
    ];

    constructor(
        private _httpClient: HttpClient
    )
    {
    }

    

    /* get user token and id => This call should be 
    taken out as soon as the chat is connected to the real dbase
    */

    getToken(payload): Observable<any> {
        return this._httpClient.post(this.chatUrls[0].generateToken, payload)
        .pipe(map((response: Response) => response));
    }

    getUser(email): Observable<any> {
        return this._httpClient.get(`${this.chatUrls[0].getUser}${email}`)
        .pipe(map((response: Response) => response));
    }


    formatChatTime(timeSent): any {
        const splitTime = timeSent && timeSent.split('T');
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
        } else if (hours < 12 && hours > 9) {
            formattedTime = `${hours}:${minutes} AM`;
        } else if (hours < 12) {
            formattedTime = `${hours}:${minutes} AM`;
        }else {
            formattedTime = `0${hours}:${minutes} PM`;
        }
        return `${formattedDate}, ${formattedTime }`;

    }

    fetchContacts(): Observable<any> {
        return this._httpClient.get(this.chatUrls[0].contactList)
        .pipe(map((response: Response) => response));
    }


    fetchChatHistory(params, page, limit): Observable<any> {

        const { privateChat } = params;

        if (privateChat) {
            const { username } = params;
            return this._httpClient.get(`${this.chatUrls[0].privateChatHistory}recipientUsername=${username}&page=${page}&pagesize=${5}`)
            .pipe(map((response: Response) => response));
        }
        const { groupId } = params;
        return this._httpClient.get(`${this.chatUrls[0].groupChatHistory}groupId=${groupId}&page=${page}&pagesize=${limit}`)
        .pipe(map((response: Response) => response));
    }

    // Create a new group
    createGroup(name): Observable<any> {
        return this._httpClient.post(this.chatUrls[0].groupUrl, name)
        .pipe(map((response: Response) => response));
    }


    fetchUserChatGroups(): Observable<any> {
        return this._httpClient.get(`${this.chatUrls[0].groupUrl}`)
        .pipe(map((response: Response) => response));
    }

    deleteGroup(groupId): Observable<any> {
        return this._httpClient.delete(`${this.chatUrls[0].groupUrl}/${groupId}`)
            .pipe(map((response: Response) => response));
    }

    sendChatFile(file): any {
        return this._httpClient.post(`${this.chatUrls[0].sendFile}`, file)
            .pipe(map((response: Response) => response));
    }

    getChatFile(messageId): any {
        return this._httpClient.get(`${this.chatUrls[0].getFile}=${messageId}`)
            .pipe(map((response: Response) => response));
    }


    sendChatNotification(title, options): any {
        const notification = new Notification(title, options);
        const notificationsound = new Audio('assets/sounds/unsure.mp3');
        notificationsound.play(); 
        return notification;
    }

    deletePrivateMesssages(messageIds): any {
        return this._httpClient.patch(`${this.chatUrls[0].deletePrivateMessage}`, messageIds)
            .pipe(map((response: Response) => response));
    }

    deleteGroupMesssages(messageIds): any {
        return this._httpClient.patch(`${this.chatUrls[0].deleteGroupMessage}`, messageIds)
            .pipe(map((response: Response) => response));
    }


    exitGroup(groupId, username): any {
        return this._httpClient.patch(`${this.chatUrls[0].exitGroup}`, { groupId, username })
            .pipe(map((response: Response) => response));
    }

    blockContact(OwnerId, ContactId): any {
        return this._httpClient.post(`${this.chatUrls[0].blockContact}`, { OwnerId, ContactId })
            .pipe(map((response: Response) => response));
    }
}
