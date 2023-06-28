import { Component, EventEmitter, OnInit, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

// Redux Store
import { Store, select } from '@ngrx/store';
import { GptAssistantProjectStore } from '../../data-access/store/interface';
import { ChatExportService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/export';

import { NavigationItem } from "@appkit4/angular-components/navigation";
import { Observable, Subject, takeUntil } from 'rxjs';
import { Conversation } from 'src/app/shared/models/conversation.model';
import { selectConversations, selectConversation, selectWizzardState } from '../../../copilot-assistent-project/data-access/store/selectors';

import { MainProjectStore } from 'src/app/shared/store/interface';
import { selectIsWebsocketConnected } from 'src/app/shared/store/selectors';

// Modal
import { UserShareModalComponent } from '../add-user-modal/modal.component';
import { setActiveConversation, setSidebarIndex, setWizzardState } from '../../data-access/store/actions';

// Websocket
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { GptModel } from 'src/app/shared/models/gpt-model.model';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';
import { DeleteChatModalComponent } from '../delete-chat-modal/delete-chat-modal.component';

@Component({
  selector: 'chat-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {

  @ViewChild(UserShareModalComponent, { static: false }) shareConversationModal: UserShareModalComponent;
  @ViewChild(DeleteChatModalComponent, { static: false }) deleteChatModal: DeleteChatModalComponent;

  private _unsubscribeAll: Subject<void>;
  public isWebsocketConnected: boolean = false;
  public isWebsocketConnected$: Observable<boolean>;
  public conversations: Conversation[] | null;

  public wizzardStates = WizzardState;
  public wizzardState: WizzardState = WizzardState.LANDING_PAGE;
  public wizzardState$: Observable<WizzardState>;

  public currentConversationObservable: Observable<Conversation | null>;
  public currentConversationsObservable: Observable<Conversation[] | null>;

  public sidebarIndexObservable: Observable<number>;
  public currentConversation: Conversation | null;

  public solid: boolean = false;
  public simple: boolean = true;
  public collapsed: boolean = false;
  public selectedIndex: number = -1;
  public selectedSubIndex: number = -1;
  public navList: NavigationItem[] = [];
  public selectedNavItem: NavigationItem | null;
  public currentConversationId: string | null = null;
  public currentTopic: string | null = null;

  @Output() resetView: EventEmitter<void> = new EventEmitter<void>();
  @Output() onRedirect: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private gptAssistantProjectState: Store<GptAssistantProjectStore>,
    private chatExportService: ChatExportService,
    private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService,
    private mainProjectStore: Store<MainProjectStore>
  ) {
    this.gptAssistantProjectState.pipe(select(selectConversations));
    this.currentConversationObservable = this.gptAssistantProjectState.pipe(select(selectConversation));
    this.currentConversationsObservable = this.gptAssistantProjectState.pipe(select(selectConversations));
    this.sidebarIndexObservable = this.gptAssistantProjectState.pipe(select(state => state.gptAssistantState.sidebarIndex));
    this.isWebsocketConnected$ = this.mainProjectStore.pipe(select(selectIsWebsocketConnected));
    this.wizzardState$ = this.gptAssistantProjectState.pipe(select(selectWizzardState));
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();

    this.wizzardState$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(wizzardState => {
      this.wizzardState = wizzardState;
    }
    );

    this.currentConversationObservable
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(conversation => {
        this.currentConversation = conversation;
        this.currentConversationId = conversation?.id ? conversation.id.split('-')[0] : null;
        this.currentTopic = conversation?.topic || null;
        this.cdr.markForCheck();
      });


    this.currentConversationsObservable.subscribe(conversations => {
      this.conversations = conversations;
      this.createNavListFromConversations();
      this.cdr.markForCheck();
    });


    this.sidebarIndexObservable.subscribe(index => {
      this.selectedIndex = index;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.isWebsocketConnected$.subscribe(isWebsocketConnected => {
      if (isWebsocketConnected) {
        setTimeout(() => {
          this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATIONS);
        }, 100);
      }
    });

  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  openShareConversationModal(topic: string) {
    this.shareConversationModal.title = topic;
    this.shareConversationModal.showModal();
  }


  openDeleteChatModal(topic: string) {
    this.deleteChatModal.title = topic;
    this.deleteChatModal.conversationId = this.currentConversationId;
    this.deleteChatModal.showModal();
  }


  createNavListFromConversations() {
    if (this.conversations) {
      this.navList = [
        {
          name: 'New Chat',
          prefixIcon: 'circle-plus',
        },
        ...this.conversations.map((conversation, index) => ({
          name: conversation.topic ?
            (conversation.topic.length > 20 ?
              `${conversation.topic.slice(0, 20)}...` : conversation.topic)
            : 'No Topic',
          prefixIcon: 'comment',
          suffixIcon: 'down-chevron',
          conversationIndex: index,
          children: [
            {
              name: 'Export Chat',
              prefixIcon: 'download-light',
              conversationIndex: index
            },
            {
              name: 'Share Conversation',
              prefixIcon: 'add-user',
              conversationIndex: index
            },
            {
              name: 'Delete',
              prefixIcon: 'circle-delete',
              conversationIndex: index
            }
          ]
        })),
      ];
    }
  }

  onCollapsedSidebar(event: any): void {
  }

  redirect(event: any) {
    this.gptAssistantProjectState.dispatch(setSidebarIndex({ sidebarIndex: event.selectedIndex }));

    const index = event.item.conversationIndex;
    const conversation = this.conversations?.[index];

    if (conversation && conversation.id != this.currentConversation?.id) {
      this.gptAssistantProjectState.dispatch(setActiveConversation({ activeConversation: conversation }));
      this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATION_BY_ID,"", conversation.id);
    }
    if (event.item.name === 'New Chat') {
      this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.NEW_CHAT }));
      this.gptAssistantProjectState.dispatch(setActiveConversation({ activeConversation: null }));
      this.resetView.emit();
    } else if (event.item.name === 'Export Chat') {
      if (conversation  && this.currentConversation) {
        this.chatExportService.exportToXLSX(this.currentConversation);
      }
    } else if (event.item.name === 'Delete') {
      if (conversation) {
        if (conversation) {
          this.openDeleteChatModal("Please confirm deletion of Chat: " + conversation.topic || 'No Topic');
        }
      }
    } else if (event.item.name === 'Share Conversation') {
      if (conversation) {
        //this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.SHARED_CONVERSATION }));
        this.openShareConversationModal("Share Chat: " + conversation.topic || 'No Topic');
      }
    } else {
      this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.EXISTING_CHAT }));
      const conversation = this.conversations?.[event.item.conversationIndex];
    }
  }

  onClickSuffixIcon(event: any): void {
    const conversation = this.conversations?.[event.item.conversationIndex];
    if (conversation) {
      this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.CHAT_FEATURES }));
      this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATION_BY_ID,"", conversation.id);
    }
  }

  getCurrentConversationId(): string | undefined {
    if (this.currentConversation && this.currentConversation.id) {
      const currentConversationName = this.currentConversation.id.split('-')[0];
      return currentConversationName;
    }
    return undefined;
  }
}
