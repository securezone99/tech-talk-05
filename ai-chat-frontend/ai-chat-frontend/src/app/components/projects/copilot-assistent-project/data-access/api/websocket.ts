import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, User } from 'src/app/shared/models/conversation.model';
import { ApplicationUser } from 'src/app/shared/models/user/user.model';
import { KeycloakGuard } from 'src/app/services/keycloak/keycloak-guard.service';


// Store
import * as AssistantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';
import * as MainActions from 'src/app/shared/store/actions';

import { selectActiveConversation, selectConversation, selectConversations } from 'src/app/components/projects/copilot-assistent-project/data-access/store/selectors';
import { selectUser } from 'src/app/shared/store/selectors';

import { GptAssistantProjectStore } from '../store/interface';
import { MainProjectStore } from 'src/app/shared/store/interface';
import { Store, select } from '@ngrx/store';
import { GptModel } from '../../../../../shared/models/gpt-model.model';

// Websocket
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';
import { setWizzardState } from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';
import { BackendMessage } from 'src/app/shared/models/message/backend-message.model';
import { BackendMessageType } from 'src/app/shared/models/message/backendMessageType';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: WebSocket;
  private messageQueue: string[] = [];
  private isSocketOpen: boolean = false;
  private conversations: Conversation[] | null;
  private conversationsObservable: Observable<Conversation[] | null>;

  public boradcastingUserObservable$: Observable<ApplicationUser | null>;
  public boradcastingUser: ApplicationUser | null;

  public messageBuffer: string = ""
  public backendMessage: BackendMessage = { content: '', type: BackendMessageType.SUCCESS };

  public activeConversation: Conversation | null;
  public activeConversationObservable$: Observable<Conversation | null>;

  constructor
    (
      private readonly keycloakGuard: KeycloakGuard,
      private gptAssistantProjectState: Store<GptAssistantProjectStore>,
      private mainProjectStore: Store<MainProjectStore>
    ) {
    this.connect();

  }

  public subscribeToActiveConversation(): void {
    this.boradcastingUserObservable$ = this.mainProjectStore.pipe(select(selectUser));
    this.boradcastingUserObservable$.subscribe(boradcastingUser => {
      this.boradcastingUser = boradcastingUser;
    });

    this.activeConversationObservable$ = this.gptAssistantProjectState.pipe(select(selectActiveConversation));
    this.activeConversationObservable$.subscribe(activeConversation => {
      this.activeConversation = activeConversation;
    });

    this.conversationsObservable = this.gptAssistantProjectState.pipe(select(selectConversations));
    this.conversationsObservable.subscribe(conversations => {
      this.conversations = conversations;
    }
    );
  }

  public connect(): void {
    this.mainProjectStore.dispatch(MainActions.setWebsocketConnectionState({ isWebsocketConnected: false }));
    const token = this.keycloakGuard.getToken();
    const wsHost = window.location.protocol.replace('http', 'ws') + '//' + window.location.host;
    const wsUrl = `${wsHost}/ws/copilotAssistentProject/ws/${token}`;

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(wsUrl);
      this.initializeSocketHandlers();
      // Periodically send a "ping" message
      setInterval(() => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send('ping');
        }
      }, 25000);
    }
  }

  private initializeSocketHandlers(): void {
    this.socket.onopen = () => {

      this.isSocketOpen = true;
      this.sendQueuedMessages();
      console.log("Connection established");
      setTimeout(() => {
        this.mainProjectStore.dispatch(MainActions.setWebsocketConnectionState({ isWebsocketConnected: true }));
      }, 300);


      this.mainProjectStore.dispatch(MainActions.loadingBackendMessage({ backendMessage: this.backendMessage }));
    };

    this.socket.onclose = () => {
      console.log("Connection closed");
      this.mainProjectStore.dispatch(MainActions.setWebsocketConnectionState({ isWebsocketConnected: false }));


      //this.backendMessage = {...this.backendMessage, content: "Connection closed, reconnecting...", type: BackendMessageType.WARNING};
      this.mainProjectStore.dispatch(MainActions.loadingBackendMessage({ backendMessage: this.backendMessage }));

      this.isSocketOpen = false;
      setTimeout(() =>
        this.connect(), 2500);
    };

    this.socket.onmessage = (event) => {

      const websocketMessage = JSON.parse(event.data);
      const broadcastingUser = websocketMessage.user;
      const message = websocketMessage.websocket_message;

      if (websocketMessage.type === "notification") {
        const detailMessage = message.error_mesage ? "\n Detail: " + message.error_mesage : '';
        this.backendMessage = { ...this.backendMessage, content: detailMessage, type: message.type.toLowerCase() };
        this.mainProjectStore.dispatch(MainActions.loadingBackendMessage({ backendMessage: this.backendMessage }));

        return;
      }

      switch (message.type) {
        case WebsocketAction.GET_CONVERSATIONS:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let getConversations: Conversation[] = message.message;
          this.gptAssistantProjectState.dispatch(AssistantActions.setConversations({ conversations: getConversations }));
          break;

        case WebsocketAction.CREATE_AI_MESSAGE:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let conversation: Conversation = message.message;

          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === conversation.id)) {
            this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.EXISTING_CHAT }));
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: conversation }));
            //this.sendMessage(WebsocketAction.GET_CONVERSATIONS);
          }

          break;

        case WebsocketAction.CREATE_AI_CHAT_WITH_INIT_MESSAGE:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let initConversation: Conversation = message.message;
          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === initConversation.id)) {
            this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.EXISTING_CHAT }));
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: initConversation }));
            if (this.conversations) {
              this.gptAssistantProjectState.dispatch(AssistantActions.setSidebarIndex({ sidebarIndex: this.conversations?.length + 1 }));
            }
          }

          if (initConversation.blobs) {
            this.sendMessage(WebsocketAction.CREATE_AI_MESSAGE, initConversation.blobs[0].content, initConversation.id, initConversation.blobs[0].model);
          }
          break;

        case WebsocketAction.ADD_USER_MESSAGE:
          let conversationWithNewMessage: Conversation = message.message;

          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === conversationWithNewMessage.id)) {
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: conversationWithNewMessage }));
          }

          break;

        case WebsocketAction.DELETE_CONVERSATION:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let deleteConversations: Conversation[] = message.message;
          this.gptAssistantProjectState.dispatch(AssistantActions.setConversations({ conversations: deleteConversations }));
          this.mainProjectStore.dispatch(MainActions.loadingStarted());
          this.sendMessage(WebsocketAction.GET_CONVERSATIONS);
          break;

        case WebsocketAction.GET_CONVERSATION_BY_ID:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let getConversationById: Conversation = message.message;

          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === getConversationById.id)) {
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: getConversationById }));
          }

          break;

        case WebsocketAction.ADD_USER_TO_MESSAGE:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let addUserToMessage: Conversation = message.message;

          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === addUserToMessage.id)) {
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: addUserToMessage }));
          }
          this.mainProjectStore.dispatch(MainActions.loadingStarted());
          this.sendMessage(WebsocketAction.GET_CONVERSATIONS);
          break;

        case WebsocketAction.REMOVE_USER_FROM_MESSAGE:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let removeUserFromMessage: Conversation = message.message;

          if ((broadcastingUser == this.boradcastingUser?.email) || (this.activeConversation?.id === removeUserFromMessage.id)) {
            this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: removeUserFromMessage }));
          }
          this.mainProjectStore.dispatch(MainActions.loadingStarted());
          this.sendMessage(WebsocketAction.GET_CONVERSATIONS);
          break;

        case WebsocketAction.SEARCH_USER:
          this.mainProjectStore.dispatch(MainActions.loadingFinished());
          let users: User[] = message.message;
          this.gptAssistantProjectState.dispatch(AssistantActions.setLdapUsers({ ldapUsers: users }));
          break;

        default:
          console.error('Received unknown WebSocket message type:', message.type);
          break;
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error:', error);
    };
  }

  private sendQueuedMessages(): void {
    let message;
    while (message = this.messageQueue.shift()) {
      this.socket.send(message);
    }
  }

  public sendMessage(action: string, message?: string, conversationId?: string, gptModel?: GptModel, userEmail?: string, searchTerm?: string): void {
      this.mainProjectStore.dispatch(MainActions.loadingStarted());
      const payload = JSON.stringify({
        action: action,
        chatMessage: message,
        conversationId: conversationId,
        gptModel: gptModel,
        email: userEmail,
        searchTerm: searchTerm
      });
      if (this.isSocketOpen) {
        this.socket.send(payload);
      } else {
        this.messageQueue.push(payload);
      }
  }
}
