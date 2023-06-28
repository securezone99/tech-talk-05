import { BackendMessageType } from "./backendMessageType";

export interface BackendMessage {
  type: BackendMessageType;
  content: string;
}
