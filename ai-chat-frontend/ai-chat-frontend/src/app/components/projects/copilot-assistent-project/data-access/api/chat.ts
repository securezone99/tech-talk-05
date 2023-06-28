import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, catchError, first, fromEvent, map, takeUntil, throwError } from 'rxjs';
import { MainProjectStore } from 'src/app/shared/store/interface';
import * as MainActions from 'src/app/shared/store/actions';
import { Store, select } from '@ngrx/store';
import { GptModel } from 'src/app/shared/models/gpt-model.model';
import { Conversation, User } from 'src/app/shared/models/conversation.model';
import * as AssistantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';
import { selectConversation } from 'src/app/components/projects/copilot-assistent-project/data-access/store/selectors';
import { GptAssistantProjectStore } from 'src/app/components/projects/copilot-assistent-project/data-access/store/interface';
import { KeycloakGuard } from 'src/app/services/keycloak/keycloak-guard.service';

// Websocket
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {

  private _unsubscribeAll: Subject<void>;
  public conversation: Conversation | null;
  public conversationObservable: Observable<Conversation | null>;

  constructor
    (
      private readonly keycloakGuard: KeycloakGuard,
      private http: HttpClient,
      private mainProjectStore: Store<MainProjectStore>,
      private gptAssistantProjectState: Store<GptAssistantProjectStore>

    ) {
    this._unsubscribeAll = new Subject();
    this.conversationObservable = this.gptAssistantProjectState.pipe(select(selectConversation));
  }

  private unsubscribe(): void {
    if (this._unsubscribeAll) {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
    }
  }

  // deleteMessage(conversationId: string, messageId: string): void {
  //   this.mainProjectStore.dispatch(MainActions.loadingStarted());
  //   this.http.delete<Conversation>('api/copilotAssistentProject/delete_message/' + conversationId + '/' + messageId)
  //     .pipe(
  //       first(),
  //       catchError(err => {
  //         if (err.status !== 200) {
  //           const detailMessage = err.error.detail ? "\n Detail: " + err.error.detail : '';
  //           this.mainProjectStore.dispatch(MainActions.showNotification({ error: detailMessage }));
  //         }
  //         throw err;
  //       }),
  //       map(res => {
  //         this.mainProjectStore.dispatch(MainActions.loadingFinished());
  //         this.gptAssistantProjectState.dispatch(AssistantActions.setConversation({ conversation: res }));
  //         this.unsubscribe()
  //       })
  //     ).subscribe();
  // }

 }
