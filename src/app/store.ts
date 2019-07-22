import { AllContactsI, AppStateI } from './interfaces';
import { AllEnums } from './enums';

export const initialState:  AppStateI = {
  allContacts: [],
  chatPanelLocation: AllEnums.SIDE_CHAT_PANEL
};
