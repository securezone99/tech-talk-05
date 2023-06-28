import { createReducer, on } from '@ngrx/store';
import { MainState } from './interface';
import * as MainActions from './actions';
import { ApplicationUser } from '../models/user/user.model';
import { BackendMessageType } from '../models/message/backendMessageType';

export const initialState: MainState = {
  isLoading: false,
  backendMessage: { content: '', type: BackendMessageType.SUCCESS},
  user: {} as ApplicationUser,
  isWebsocketConnected: false
}

export const mainReducers = createReducer(
    initialState,
    on(MainActions.loadingStarted, (state) => ({ ...state, isLoading: true})),
    on(MainActions.loadingFinished, (state) => ({ ...state, isLoading: false})),
    on(MainActions.loadingBackendMessage, (state, action) => ({ ...state, isLoading: false, backendMessage: action.backendMessage})),
    on(MainActions.setUser, (state, action) => ({ ...state, user: action.user})),
    on(MainActions.setWebsocketConnectionState, (state, action) => ({ ...state, isWebsocketConnected: action.isWebsocketConnected}))
);

