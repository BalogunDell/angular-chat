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

  getMessagesFromContactList = (userId, contacts) => {
    const contact = contacts.find(currentContact => {
      const { id, groupId } = currentContact;
      const idToUse = id ? id : groupId; 
      return idToUse === userId;
    });
    return contact && contact.messages;
  }
}
