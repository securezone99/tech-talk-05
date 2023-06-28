import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopilotNotificationModalComponent } from './copilot-notification-modal.component';
import { ModalModule } from '@appkit4/angular-components/modal';
import { ButtonModule } from '@appkit4/angular-components/button';
import { BadgeModule } from "@appkit4/angular-components/badge";
import { NotificationModule } from '@appkit4/angular-components/notification';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [CopilotNotificationModalComponent],
  imports: [
    CommonModule,
    ModalModule,
    ButtonModule,
    BadgeModule,
    NotificationModule,
    BrowserAnimationsModule
  ],
  exports: [CopilotNotificationModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CopilotNotificationModalModule { }
