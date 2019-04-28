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
        groupChatHistory: 'http://localhost:5000/api/messages/getGroupMessages?',
        groupUrl: 'http://localhost:5000/api/groups',
        addUserToGroup: 'http://localhost:5000/api/users/addUserToGroup',
        sendFile: 'http://localhost:5000/api/messages/sendMediaMessage',
        getFile: 'http://localhost:5000/api/messages/GetMediaMessage?messageId',
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
            formattedTime = `0${hours}:${minutes} AM`;
        } else {
            formattedTime = `0${hours}:${minutes} PM`;
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


    fetchChatHistory(token, params, page, limit): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };

        const { privateChat } = params;

        if (privateChat) {
            const { username } = params;
            return this._httpClient.get(`${this.chatUrls[0].privateChatHistory}recipientUsername=${username}&page=${page}&pagesize=${limit}`, httpOptions)
            .pipe(map((response: Response) => response));
        }
        const { groupId } = params;
        return this._httpClient.get(`${this.chatUrls[0].groupChatHistory}groupId=${groupId}&page=${page}&pagesize=${limit}`, httpOptions)
        .pipe(map((response: Response) => response));
    }

    // Create a new group
    createGroup(name, token): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.post(this.chatUrls[0].groupUrl, name, httpOptions)
        .pipe(map((response: Response) => response));
    }


    /**
     * Fetch user chat groups 
     *
     * @param {*} token
     * @returns {Observable<any>}
     * @memberof ChatPanelService
     */
    fetchUserChatGroups(token): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.get(`${this.chatUrls[0].groupUrl}`, httpOptions)
        .pipe(map((response: Response) => response));
    }

    deleteGroup(token, groupId): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.delete(`${this.chatUrls[0].groupUrl}/${groupId}`, httpOptions)
            .pipe(map((response: Response) => response));
    }

    sendChatFile(token, file): any {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.post(`${this.chatUrls[0].sendFile}`, file, httpOptions)
            .pipe(map((response: Response) => response));
    }

    getChatFile(token, messageId): any {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,

            })
        };
        return this._httpClient.get(`${this.chatUrls[0].getFile}=${messageId}`, httpOptions)
            .pipe(map((response: Response) => response));
    }

    requestChatNotificationPermission(): any {
       return Notification.requestPermission()
        .then(perm => {
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
}
