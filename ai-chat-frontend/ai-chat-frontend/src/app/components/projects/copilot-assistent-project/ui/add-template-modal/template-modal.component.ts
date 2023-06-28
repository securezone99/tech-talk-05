// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
// import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';
// import { Conversation, User } from 'src/app/shared/models/conversation.model';
// import { GptAssistantProjectStore } from '../../data-access/store/interface';
// import { Store, select } from '@ngrx/store';
// import { selectConversation } from '../../data-access/store/selectors';

// // Websockets
// import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
// import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';


// @Component({
//   selector: 'template-modal',
//   templateUrl: './template-modal.component.html',
//   styleUrls: ['./template-modal.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class TemplateModalComponent {

//   private _unsubscribeAll: Subject<void>;

//   public style: string = 'width: 540px;';
//   public contentStyle: string = 'min-height: 92px;';
//   public footerStyle: string = 'padding-top: 8px; margin-top: -8px; min-height: 64px;';
//   public title: string = '';
//   public email: string = '';
//   public emailChange = new Subject<string>();

//   public conversation: Conversation | null;
//   public conversationObservable: Observable<Conversation | null>;

//   public ldapUsers: User[] | null;
//   public ldapUserList: { primary: string; avatar: string; backgroundColor: string; fontColor: string; description: string }[] = [];
//   public ldapUsersObservable: Observable<User[]>;

//   public userList: { primary: string; avatar: string; backgroundColor: string; fontColor: string; description: string }[] = [];



//   @ViewChild('templateModal', { static: false }) modal: any;

//   constructor(
//     private gptAssistantProjectStore: Store<GptAssistantProjectStore>,
//     private cdr: ChangeDetectorRef,
//     private webSocketService: WebSocketService
//   ) {
//     this.conversationObservable = this.gptAssistantProjectStore.pipe(select(selectConversation));
//     this.ldapUsersObservable = this.gptAssistantProjectStore.pipe(select(state => state.gptAssistantState.ldapUsers));
//   }

//   ngOnInit() {
//     this._unsubscribeAll = new Subject();

//     this.emailChange
//     .pipe(
//       debounceTime(200),
//       takeUntil(this._unsubscribeAll)
//     )
//     .subscribe(email => {
//       this.webSocketService.sendMessage(WebsocketAction.SEARCH_USER, undefined, undefined, undefined, undefined,this.email);
//     });

//     this.ldapUsersObservable
//       .pipe(takeUntil(this._unsubscribeAll))
//       .subscribe(ldapUsers => {
//         if (ldapUsers) {
//           this.ldapUsers = ldapUsers;
//           this.ldapUserList = ldapUsers
//               .filter(ldapUser => !this.userList.some(user => user.primary === ldapUser.email))
//               .map((user) => {
//                   let backgroundColor = "#D04A02";
//                   let fontColor = "#ffffff";
//                   let description = "";
//                   return {
//                       description: description,
//                       primary: user.email,
//                       avatar: user.shortName.toUpperCase(),
//                       backgroundColor: backgroundColor,
//                       fontColor: fontColor
//                   }
//               });
//           this.cdr.detectChanges();
//       }

//       });

//     this.conversationObservable
//       .pipe(takeUntil(this._unsubscribeAll))
//       .subscribe(conversation => {
//         this.conversation = conversation;
//         if (conversation?.users) {
//           this.userList = conversation.users.map((user, index) => {
//             let backgroundColor = "#D04A02";
//             let fontColor = "#ffffff";
//             let description = "";
//             return {
//               description: description,
//               primary: user.email,
//               avatar: user.shortName.toUpperCase(),
//               backgroundColor: backgroundColor,
//               fontColor: fontColor
//             }
//           });
//         }
//         this.cdr.detectChanges();
//       });
//   }

//   ngOnDestroy() {
//     this._unsubscribeAll.next();
//     this._unsubscribeAll.complete();
//   }

//   showModal() {
//     this.modal.showModal('modal-template');
//   }

//   onLdapUserClick(user: any) {
//     if (this.conversation && this.conversation.blobs) {
//       this.webSocketService.sendMessage(WebsocketAction.ADD_USER_TO_MESSAGE, undefined, this.conversation.id, undefined, user.primary);
//       this.ldapUserList = this.ldapUserList.filter(ldapUser => ldapUser.primary !== user.primary);
//     }
//   }

//   handleCancel() {
//     this.modal.closeModal('modal-template');
//   }

//   onClickkDelete(email: string) {
//     if (this.conversation && this.conversation.blobs) {
//       this.webSocketService.sendMessage(WebsocketAction.REMOVE_USER_FROM_MESSAGE, undefined, this.conversation.id, undefined, email);
//     }
//   }

//   onClickShare(event: any) {
//     if (this.conversation && this.conversation.blobs) {
//       this.webSocketService.sendMessage(WebsocketAction.ADD_USER_TO_MESSAGE, undefined, this.conversation.id, undefined, this.email);
//     }
//   }
// }
