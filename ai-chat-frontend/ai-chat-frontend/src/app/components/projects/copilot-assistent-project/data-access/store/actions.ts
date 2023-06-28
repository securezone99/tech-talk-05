import { createAction, props } from "@ngrx/store";
import { Conversation, User } from "src/app/shared/models/conversation.model";
import { GptModel } from "src/app/shared/models/gpt-model.model";
import { WizzardState } from "src/app/shared/models/wizzard-state.model";

export const setInteractionTerm = createAction('[Input Field] Get GPT Interaction Term', props<{ interactionTerm: string | null }>());
export const setConversation= createAction('[CONVERSATION] Conversation with GPT', props<{ conversation: Conversation | null }>());
export const setConversations = createAction('[CONVERSATIONS] Conversations with GPT', props<{ conversations: Conversation[] }>());
export const setGptModel = createAction('[GPT Model] Set GPT Model', props<{ gptModel: GptModel }>());
export const setActiveConversation = createAction('[Active Conversation] Set Active Conversation', props<{ activeConversation: Conversation | null }>());
export const setLdapUsers = createAction('[LDAP Users] Set LDAP Users', props<{ ldapUsers: User[] }>());
export const setSidebarIndex = createAction('[Sidebar Index] Set Sidebar Index', props<{ sidebarIndex: number }>());
export const setWizzardState = createAction('[Wizzard State] Set Wizzard State', props<{ wizzardState: WizzardState }>());
export const clearGptAssistantState = createAction('[GPT Assistant] Clear GPT Assistant State');

