import { createAction, props } from "@ngrx/store";
import { ApplicationUser } from "../models/user/user.model";
import { BackendMessage } from "../models/message/backend-message.model";

export const loadingStarted = createAction('[LOADING] Started');
export const loadingFinished = createAction('[LOADING] Finished');
export const loadingBackendMessage= createAction('[SHOW] BackendMessage', props<{ backendMessage: BackendMessage }>());
export const setUser = createAction('[User] User init', props<{ user: ApplicationUser }>());
export const setWebsocketConnectionState = createAction('[Websocket] Set websocket connection state', props<{ isWebsocketConnected: boolean }>());

// export function showNotification(arg0: { backendMessage: BackendMessage; }): any {
//   throw new Error('Function not implemented.');
// }

