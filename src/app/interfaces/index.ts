export interface AppStateI {
  allContacts: AllContactsI[];
  chatPanelLocation: number;
}

export interface AllContactsI {
  id: number;
  username: string;
  mood: string;
  status: string;
  avatar: string;
}
