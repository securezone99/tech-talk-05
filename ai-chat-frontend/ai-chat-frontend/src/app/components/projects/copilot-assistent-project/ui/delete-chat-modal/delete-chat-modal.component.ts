import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Conversation, User } from 'src/app/shared/models/conversation.model';
import { GptAssistantProjectStore } from '../../data-access/store/interface';
import { Store, select } from '@ngrx/store';
import { selectConversation } from '../../data-access/store/selectors';
import * as AssitantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';

// Websockets
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';

@Component({
  selector: 'delete-chat-modal',
  templateUrl: './delete-chat-modal.component.html',
  styleUrls: ['./delete-chat-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteChatModalComponent {

  public style: string = 'width: 540px;';
  public contentStyle: string = 'min-height: 92px;';
  public footerStyle: string = 'padding-top: 0px; margin-top: -0px; min-height: 0px;';
  public title: string = '';
  public conversationId: string | null = null;

  @ViewChild('deleteChatModal', { static: false }) modal: any;

  constructor(
    private gptAssistantProjectStore: Store<GptAssistantProjectStore>,
    private webSocketService: WebSocketService
  ) {
  }

  showModal() {
    this.modal.showModal('delete-chat-modal');
  }


  handleCancel() {
    this.modal.closeModal('delete-chat-modal');
  }

  onClickDelete() {
    if (this.conversationId) {
      this.webSocketService.sendMessage(WebsocketAction.DELETE_CONVERSATION,"", this.conversationId);
      this.modal.closeModal('delete-chat-modal');
    }

    // Reset conversation
    this.gptAssistantProjectStore.dispatch(AssitantActions.setConversation({ conversation: null }));
  }

}
