import { createReducer, on } from '@ngrx/store';
import { GptAssistantState } from './interface';
import * as GptAssistantActions from './actions';
import { Conversation, User } from 'src/app/shared/models/conversation.model';
import { GptModel } from 'src/app/shared/models/gpt-model.model'
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';

export const initialState: GptAssistantState = {
  interactionTerm: "",
  conversation: {} as Conversation,
  conversations: null,
  gptModel: GptModel.GPT_3_5,
  activeConversation: {} as Conversation,
  ldapUsers: [],
  sidebarIndex: -1,
  wizzardState: WizzardState.LANDING_PAGE
}

export const gptAssistantState = createReducer(
    initialState,
    on(GptAssistantActions.setInteractionTerm, (state, action) => ({ ...state, interactionTerm: action.interactionTerm})),
    on(GptAssistantActions.setConversation, (state, action) => ({ ...state, conversation:  action.conversation})),
    on(GptAssistantActions.setConversations, (state, action) => ({ ...state, conversations:  action.conversations})),
    on(GptAssistantActions.setGptModel, (state, action) => ({ ...state, gptModel:  action.gptModel})),
    on(GptAssistantActions.setActiveConversation, (state, action) => ({ ...state, activeConversation:  action.activeConversation})),
    on(GptAssistantActions.setLdapUsers, (state, action) => ({ ...state, ldapUsers:  action.ldapUsers})),
    on(GptAssistantActions.setSidebarIndex, (state, action) => ({ ...state, sidebarIndex:  action.sidebarIndex})),
    on(GptAssistantActions.setWizzardState, (state, action) => ({ ...state, wizzardState:  action.wizzardState})),
    on(GptAssistantActions.clearGptAssistantState, () => ({ ...initialState }))
);

