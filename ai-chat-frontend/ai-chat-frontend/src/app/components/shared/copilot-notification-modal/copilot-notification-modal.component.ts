import { Component } from '@angular/core';
import { MainProjectStore } from 'src/app/shared/store/interface';
import { NotificationService } from '@appkit4/angular-components/notification';
import { Store, select } from '@ngrx/store';
import { selectBackenMessage } from 'src/app/shared/store/selectors';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as MainActions from 'src/app/shared/store/actions';
import { BackendMessageType } from 'src/app/shared/models/message/backendMessageType';
import { BackendMessage } from 'src/app/shared/models/message/backend-message.model';

@Component({
  selector: 'app-copilot-notification-modal',
  templateUrl: './copilot-notification-modal.component.html',
  styleUrls: ['./copilot-notification-modal.component.scss']
})

export class CopilotNotificationModalComponent {
  public backendMessage$: Observable<BackendMessage>;
  public backendMessage: BackendMessage = { content: '', type: BackendMessageType.SUCCESS};
  public position: string = 'static-topHeader';
  public id: string = 'notification1';
  public showTimed: boolean = false;
  public showExpandedIcon: boolean = false;
  public status: string = BackendMessageType.SUCCESS;
  public message: string = '';

  private _unsubscribeAll: Subject<void>;

  constructor(
    protected _notificationSvc: NotificationService,
    private mainProjectStore: Store<MainProjectStore>


  ) {
    this.backendMessage$ = this.mainProjectStore.pipe(select(selectBackenMessage));
  }

  ngAfterViewInit() {
    this._unsubscribeAll = new Subject();

    this.backendMessage$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(backendMessage => {
      if (backendMessage.content) {
        this.status = backendMessage.type;
        this.message = backendMessage.content;
        this.createNotification();
      }
    });
  }

  onClose(): void {
    this.mainProjectStore.dispatch(MainActions.loadingBackendMessage({ backendMessage: this.backendMessage }));
  }

  createNotification(): void {
    const title = '';
    const message = this.message;
    const hyperLink = '';
    const hyperLinkHref = '';
    this._notificationSvc
      .show(
        title,
        message,
        hyperLink,
        hyperLinkHref,
        {
          duration: 5000,
          id: this.id,
          clickToClose: false,
          showClose: true,
          icon: "icon-error-fill",
        },
        this.showTimed,
        this.showExpandedIcon
      )
  }

}
