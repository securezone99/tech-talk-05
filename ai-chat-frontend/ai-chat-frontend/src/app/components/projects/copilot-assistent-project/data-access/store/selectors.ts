import { createSelector } from "@ngrx/store";
import { GptAssistantProjectStore } from "./interface";

export const selectFeature = (state: GptAssistantProjectStore) => state.gptAssistantState;
export const selectInteractionTerm = createSelector(selectFeature, (state) => state.interactionTerm);
export const selectConversation = createSelector(selectFeature, (state) => state.conversation);
export const selectConversations = createSelector(selectFeature, (state) => state.conversations);
export const selectGptModel = createSelector(selectFeature, (state) => state.gptModel);
export const selectLdapUsers = createSelector(selectFeature, (state) => state.ldapUsers);
export const selectActiveConversation = createSelector(selectFeature, (state) => state.activeConversation);
export const selectWizzardState = createSelector(selectFeature, (state) => state.wizzardState);
export const selectSidebarIndex = createSelector(selectFeature, (state) => state.sidebarIndex);


