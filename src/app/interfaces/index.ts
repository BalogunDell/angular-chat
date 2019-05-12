export interface AppStateI {
  allContacts: AllContactsI[];
}

export interface AllContactsI {
  id: number;
  username: string;
  mood: string;
  status: string;
  avatar: string;
}
