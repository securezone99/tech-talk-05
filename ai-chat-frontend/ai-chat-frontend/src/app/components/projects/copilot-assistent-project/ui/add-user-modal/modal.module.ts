import { ModalModule } from '@appkit4/angular-components/modal';
import { ButtonModule } from '@appkit4/angular-components/button';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserShareModalComponent } from './modal.component';
import { FieldModule } from '@appkit4/angular-components/field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListModule } from '@appkit4/angular-components/list';
import { AvatarModule } from '@appkit4/angular-components/avatar';


@NgModule({
  declarations: [UserShareModalComponent],
  imports: [
    ModalModule,
    ButtonModule,
    FieldModule,
    FormsModule,
    CommonModule,
    ListModule,
    AvatarModule
  ],
  exports: [UserShareModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserShareModalModule { }
