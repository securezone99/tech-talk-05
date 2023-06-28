import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { NavigationModule } from '@appkit4/angular-components/navigation';
import { AvatarModule } from '@appkit4/angular-components/avatar';
import { CommonModule } from '@angular/common';
import { UserShareModalModule } from '../add-user-modal/modal.module';
import { DeleteChatModalModule  } from '../delete-chat-modal/delete-chat-modal.module';


@NgModule({
  declarations: [SidebarComponent],
  imports: [
    CommonModule,
    NavigationModule,
    AvatarModule,
    UserShareModalModule,
    DeleteChatModalModule
  ],
  exports: [SidebarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarModule { }
