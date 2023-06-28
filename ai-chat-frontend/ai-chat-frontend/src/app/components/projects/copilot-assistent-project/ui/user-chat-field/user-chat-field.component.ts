import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AutoresizeDirective } from './autoresize.directive';

@Component({
  selector: 'user-chat-field',
  templateUrl: './user-chat-field.component.html',
  styleUrls: ['./user-chat-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserChatFieldComponent {

  @ViewChild(AutoresizeDirective) autoresizeDirective: AutoresizeDirective;

  @Output() userChatFieldModel: EventEmitter<{ keyDownEvent: any, chatMessage: string }> = new EventEmitter<{ keyDownEvent: any, chatMessage: string }>();

  public chatMessage: string = '';

  constructor() { }

  onKeyDown(event: any) {
    this.userChatFieldModel.emit({ keyDownEvent: event, chatMessage: this.chatMessage });
    this.chatMessage = '';
    event.preventDefault();
  }

}
