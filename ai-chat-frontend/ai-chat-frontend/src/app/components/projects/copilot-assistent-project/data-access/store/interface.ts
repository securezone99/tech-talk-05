import { Conversation, User } from "src/app/shared/models/conversation.model";
import { GptModel } from 'src/app/shared/models/gpt-model.model';
import { WizzardState } from "src/app/shared/models/wizzard-state.model";

export interface GptAssistantState {
  interactionTerm: string | null;
  conversation: Conversation | null;
  conversations: Conversation[] | null;
  gptModel: GptModel;
  activeConversation: Conversation | null;
  ldapUsers: User[];
  sidebarIndex: number;
  wizzardState: WizzardState;
}
export interface GptAssistantProjectStore {
  gptAssistantState: GptAssistantState;
}
