import { ChatHighlighterComponent } from './chat-highlighter.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, } from '@angular/core';
import { HighlightModule, } from 'ngx-highlightjs';
import { AvatarModule } from '@appkit4/angular-components/avatar';
import { FeedModule } from '@appkit4/angular-components/feed';
import { ButtonModule } from '@appkit4/angular-components/button';

@NgModule({
  declarations: [ChatHighlighterComponent],
  imports: [
    HighlightModule,
    CommonModule,
    AvatarModule,
    FeedModule,
    ButtonModule
  ],
  exports: [ChatHighlighterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatHighlighterModule { }
