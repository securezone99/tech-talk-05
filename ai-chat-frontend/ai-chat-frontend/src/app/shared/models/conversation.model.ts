import { GptModel } from "./gpt-model.model";

export interface Conversation {
  id: string;
  uid: string;
  owner: User;
  topic?: string;
  blobs?: Message[];
  conversationHeader: string;
  users: User[];
  templates?: Template[];
  created_at?: Date;
  updated_at?: Date;
}

export enum Origin {
  AI_ASSISTANT = 'AI_ASSISTANT',
  USER = 'USER'
}

export interface Template {
  id: string;
  content: string;
  origin: Origin;
  owner: User;
  length: number;
}
export interface Message {
  id: string;
  content: string;
  origin: Origin;
  owner: User;
  length: number;
  model: GptModel;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  shortName: string;
}
