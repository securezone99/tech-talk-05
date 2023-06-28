import { Observable, Subject, takeUntil } from 'rxjs';

import { Conversation, Message } from 'src/app/shared/models/conversation.model';
import { GptModel } from 'src/app/shared/models/gpt-model.model';
import * as AssitantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';
import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';

// Store
import { GptAssistantProjectStore } from '../data-access/store/interface';
import { selectInteractionTerm, selectConversation, selectWizzardState, selectGptModel, selectConversations } from '../data-access/store/selectors';
import { Store, select } from '@ngrx/store';
import * as AssistantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';

// Websocket
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';


@Component({
  selector: 'app-copilot-assistant-project',
  templateUrl: './copilot-assistant-project.component.html',
  styleUrls: ['./copilot-assistant-project.component.scss'],
  animations: [
    trigger('openClose', [
      state('landing-page', style({
        bottom: '33.0vh',
      })),
      state('other-page', style({
        bottom: '4.7vh',
      })),
      transition('landing-page <=> other-page', [
        animate('0.3s')
      ]),
    ]),
  ]
})

export class CopilotAssistantProjectComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) private scrollContainer: ElementRef;

  private PAGE_SIZE = 7;
  private page = 0;
  private allMessages: Message[] = [];

  public gptModel$: Observable<GptModel>;
  public gptModel: GptModel = GptModel.GPT_3_5;

  public conversations: Conversation[] | null;
  public conversations$: Observable<Conversation[] | null>;
  public conversation: Conversation | null;
  public conversation$: Observable<Conversation | null>;

  public _unsubscribeAll: Subject<void>;

  public interactionTerm: Observable<string | null>;
  public _displayedMessages: Message[] = [];
  public displayedMessages: Message[] = [];
  public displayedMessages$: Observable<Message[]>;
  public wizzardStates = WizzardState;
  public wizzardState: WizzardState = WizzardState.LANDING_PAGE;
  public wizzardState$: Observable<WizzardState>;


  public title: string = "Model";
  public selectedModel = { value: 'item2', label: 'GPT-3.5 Turbo (ChatGPT)' };

  public chatMessage: string = '';

  public modelList: any[] = [
    { value: 'item2', label: 'GPT-3.5 Turbo (ChatGPT)', badgeValue: 'New' },
    { value: 'item3', label: 'GPT-4', disabled: true },
  ];

  constructor(
    private gptAssistantProjectState: Store<GptAssistantProjectStore>,
    private webSocketService: WebSocketService
  ) {
    this.interactionTerm = this.gptAssistantProjectState.pipe(select(selectInteractionTerm));
    this.gptModel$ = this.gptAssistantProjectState.pipe(select(selectGptModel));
    this.conversation$ = this.gptAssistantProjectState.pipe(select(selectConversation));
    this.wizzardState$ = this.gptAssistantProjectState.pipe(select(selectWizzardState));
    this.conversations$ = this.gptAssistantProjectState.pipe(select(selectConversations));
  }

  ngOnInit(): void {
    this._unsubscribeAll = new Subject();
    this.webSocketService.connect();
    this.webSocketService.subscribeToActiveConversation();

    this.conversation$.subscribe(conversation => {
      this.conversation = conversation;
      if (conversation?.blobs) {
        this.allMessages = conversation.blobs;
        this.showUpdatedMessages();
        this.scrollToBottomOnInit();
      }
      else {
        this.resetView();
      }

    });
    this.wizzardState$.subscribe(wizzardState => {
      this.wizzardState = wizzardState;
    }
    );

    this.gptModel$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(gptModel => {
        this.gptModel = gptModel;
      });
  }


  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  setDisplayedMessages(value: Message[]) {
    this.displayedMessages = value;
  }

  loadInitialMessages() {
    if (this.allMessages) {
      const end = this.allMessages.length;
      const start = Math.max(0, end - this.PAGE_SIZE);
      this.displayedMessages = this.allMessages.slice(start, end);
      this.page = Math.floor(start / this.PAGE_SIZE);
      this.scrollToBottomOnInit();
    }
  }

  showUpdatedMessages() {
    if (this.allMessages) {
      const end = this.allMessages.length;
      const start = Math.max(0, end - this.PAGE_SIZE);
      this.displayedMessages = this.allMessages.slice(start, end);
      this.page = Math.floor(start / this.PAGE_SIZE);
    }
  }

  onScrollToTheTop(): void {
    const container = this.scrollContainer.nativeElement;
    if (container.scrollTop === 0) {
      this.loadMoreMessagesOnScrollUp();
    }
  }

  loadMoreMessagesOnScrollUp() {
    if (this.page >= 0) {
      this.page--;
      const end = this.page * this.PAGE_SIZE;
      const start = Math.max(0, end - this.PAGE_SIZE);
      if (this.allMessages) {
        const newMessages = this.allMessages.slice(start, end);
        this.displayedMessages = [...newMessages, ...this.displayedMessages];
        if (this.allMessages.length != this.displayedMessages.length) {
          this.scrollToUpperThird();
        }
      }
    }
  }

  scrollToBottomOnInit(): void {
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  scrollToUpperThird(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight * 0.15;
  }

  userChatFieldModel(userChatFieldModel: any): void {
    userChatFieldModel.keyDownEvent.preventDefault();
    this.chatMessage = userChatFieldModel.chatMessage;

    // Check if chatMessage is not empty
    if (this.chatMessage !== '') {
      this.gptAssistantProjectState.dispatch(AssistantActions.setInteractionTerm({ interactionTerm: this.chatMessage }));
      if (this.conversation?.id != null) {

        this.webSocketService.sendMessage(WebsocketAction.ADD_USER_MESSAGE, this.chatMessage, this.conversation.id, this.gptModel);
        this.webSocketService.sendMessage(WebsocketAction.CREATE_AI_MESSAGE, this.chatMessage, this.conversation.id, this.gptModel);
      }
      else {
        this.webSocketService.sendMessage(WebsocketAction.CREATE_AI_CHAT_WITH_INIT_MESSAGE, this.chatMessage, "", this.gptModel);
      }
      this.chatMessage = '';
       this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATIONS);
    }





  }


  resetView() {
    this.selectedModel = { value: 'item2', label: 'GPT-3.5 Turbo (ChatGPT)' };

    // Reset interactionTerm
    this.gptAssistantProjectState.dispatch(AssitantActions.setInteractionTerm({ interactionTerm: null }));

    // Reset conversation
    this.gptAssistantProjectState.dispatch(AssitantActions.setConversation({ conversation: null }));

    // Reset gptModel
    this.gptAssistantProjectState.dispatch(AssitantActions.setGptModel({ gptModel: GptModel.GPT_3_5 }));

    // Reset messages
    this.allMessages = [];
    this.displayedMessages = [];
    this.page = 0;
  }

  onSelectItem(event: any): void {
    switch (event.selected.label) {
      case 'GPT-3.5 Turbo (ChatGPT)':
        this.gptAssistantProjectState.dispatch(AssitantActions.setGptModel({ gptModel: GptModel.GPT_3_5 }));
        break;
      case 'GPT-4':
        this.gptAssistantProjectState.dispatch(AssitantActions.setGptModel({ gptModel: GptModel.GPT_4 }));
        break;
    }
  }

  setAriaLabel(item: any): string {
    const prefixLabel = item.iconName ? `Icon ${item.iconName}, ` : '';
    const label = item.label || '';
    const badgeLabel = item.badgeValue ? `, Badge ${item.badgeValue}` : '';
    const suffixLabel = item.descValue ? `, ${item.descValue}` : '';
    return prefixLabel + label + badgeLabel + suffixLabel;
  }
}

