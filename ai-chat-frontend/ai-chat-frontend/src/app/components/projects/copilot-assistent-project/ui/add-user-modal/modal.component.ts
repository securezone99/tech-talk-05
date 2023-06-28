import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';
import { Conversation, User } from 'src/app/shared/models/conversation.model';
import { GptAssistantProjectStore } from '../../data-access/store/interface';
import { Store, select } from '@ngrx/store';
import { selectConversation, selectWizzardState } from '../../data-access/store/selectors';

// Websockets
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';

@Component({
  selector: 'user-share-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserShareModalComponent {

  private _unsubscribeAll: Subject<void>;

  public style: string = 'width: 540px;';
  public contentStyle: string = 'min-height: 92px;';
  public footerStyle: string = 'padding-top: 8px; margin-top: -8px; min-height: 64px;';
  public title: string = '';
  public email: string = '';
  public emailChange = new Subject<string>();

  public conversation: Conversation | null;
  public conversationObservable: Observable<Conversation | null>;

  public ldapUsers: User[] | null;
  public ldapUserList: { primary: string; avatar: string; backgroundColor: string; fontColor: string; description: string }[] = [];
  public ldapUsersObservable: Observable<User[]>;
  public wizzardState: WizzardState = WizzardState.LANDING_PAGE;
  public wizzardState$: Observable<WizzardState>;

  public userList: { primary: string; avatar: string; backgroundColor: string; fontColor: string; description: string }[] = [];



  @ViewChild('modal', { static: false }) modal: any;

  constructor(
    private gptAssistantProjectStore: Store<GptAssistantProjectStore>,
    private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService
  ) {
    this.conversationObservable = this.gptAssistantProjectStore.pipe(select(selectConversation));
    this.ldapUsersObservable = this.gptAssistantProjectStore.pipe(select(state => state.gptAssistantState.ldapUsers));
    this.wizzardState$ = this.gptAssistantProjectStore.pipe(select(selectWizzardState));
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();

    this.wizzardState$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(wizzardState => {
        this.wizzardState = wizzardState;
      });

    this.emailChange
      .pipe(
        debounceTime(400),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(email => {
        this.webSocketService.sendMessage(WebsocketAction.SEARCH_USER, undefined, undefined, undefined, undefined, this.email);
      });

    this.ldapUsersObservable
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(ldapUsers => {
        if (this.wizzardState === WizzardState.CHAT_FEATURES) {
          if (ldapUsers) {
            this.ldapUsers = ldapUsers;
            this.ldapUserList = ldapUsers
              .filter(ldapUser => !this.userList.some(user => user.primary === ldapUser.email))
              .map((user) => {
                let backgroundColor = "#D04A02";
                let fontColor = "#ffffff";
                let description = "";
                return {
                  description: description,
                  primary: user.email,
                  avatar: user.shortName.toUpperCase(),
                  backgroundColor: backgroundColor,
                  fontColor: fontColor
                }
              });
            this.cdr.detectChanges();
          }

        }
      });


    this.conversationObservable
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(conversation => {
        if (this.wizzardState === WizzardState.CHAT_FEATURES) {
          this.conversation = conversation;
          if (conversation?.users) {
            this.userList = conversation.users.map((user, index) => {
              let backgroundColor = "#D04A02";
              let fontColor = "#ffffff";
              let description = "";

              // If this is the first user, change the colors
              if (index === 0) {
                backgroundColor = "#415385";  // Set to a different color
                fontColor = "#ffffff";  // Set to a different color
                description = "Chat Owner";
              }
              return {
                description: description,
                primary: user.email,
                avatar: user.shortName.toUpperCase(),
                backgroundColor: backgroundColor,
                fontColor: fontColor
              }
            });
          }
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  showModal() {
    this.modal.showModal('modal-user-share');
  }

  onLdapUserClick(user: any) {
    if (this.conversation && this.conversation.blobs) {
      this.webSocketService.sendMessage(WebsocketAction.ADD_USER_TO_MESSAGE, undefined, this.conversation.id, undefined, user.primary);
      this.ldapUserList = this.ldapUserList.filter(ldapUser => ldapUser.primary !== user.primary);
    }
  }

  onEmailChange() {
    if (this.email.length >= 3) {
      this.webSocketService.sendMessage(WebsocketAction.SEARCH_USER, undefined, undefined, undefined, undefined, this.email);
    }
  }

  handleCancel() {
    this.modal.closeModal('modal-user-share');
  }

  onClickkDelete(email: string) {
    if (this.conversation && this.conversation.blobs) {
      this.webSocketService.sendMessage(WebsocketAction.REMOVE_USER_FROM_MESSAGE, undefined, this.conversation.id, undefined, email);

    }
  }

  onClickShare(event: any) {
    if (this.conversation && this.conversation.blobs) {
      this.webSocketService.sendMessage(WebsocketAction.ADD_USER_TO_MESSAGE, undefined, this.conversation.id, undefined, this.email);
    }
  }
}
