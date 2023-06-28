import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { UserChatFieldComponent } from './user-chat-field.component';
import { FieldModule } from '@appkit4/angular-components/field';
import { FormsModule } from '@angular/forms';
import { AutoresizeDirective } from './autoresize.directive';
import { TooltipModule } from '@appkit4/angular-components/tooltip';
import { ButtonModule } from '@appkit4/angular-components/button';

@NgModule({
  declarations: [UserChatFieldComponent,AutoresizeDirective],
  imports: [
    FormsModule,
    FieldModule,
    TooltipModule,
    ButtonModule
  ],
  exports: [UserChatFieldComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserChatFieldModule { }
