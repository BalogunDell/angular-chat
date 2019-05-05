export class ChatHelperService {

  // This gets the email
  mapMessageParticipantIdToUsername = (messages, contacts, currentUser): any => {
    return messages.map(message => {
      message.senderId = currentUser;
      const recipient = contacts.find(contact => contact.id === message.recipientId);
      message.recipientId = recipient ? recipient.username : currentUser;
      return message;
    });
  }
}
