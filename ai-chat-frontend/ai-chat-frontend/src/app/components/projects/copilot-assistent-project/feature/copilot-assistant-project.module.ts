import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CopilotAssistantProjectComponent } from './copilot-assistant-project.component';
import { UserChatFieldModule } from '../ui/user-chat-field/user-chat-field.module';
import { FieldModule } from '@appkit4/angular-components/field';
import { FormsModule } from '@angular/forms';
import { DropdownModule} from '@appkit4/angular-components/dropdown';
import { BadgeModule } from "@appkit4/angular-components/badge";
import { CheckboxModule } from "@appkit4/angular-components/checkbox";
import { ComboboxModule } from "@appkit4/angular-components/combobox";
import { TagModule } from "@appkit4/angular-components/tag";
import { SidebarModule } from '../ui/sidebar/sidebar.module';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from '@appkit4/angular-components/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChatHighlighterModule } from '../ui/chat-highlighter/chat-highlighter.module';

// Redux Stores
import { StoreModule } from '@ngrx/store';
import { gptAssistantState } from '../data-access/store/reducers';



const routes: Routes = [
  {
    path: '',
    component: CopilotAssistantProjectComponent
  }
];

@NgModule({
  declarations: [CopilotAssistantProjectComponent],
  imports: [
    CommonModule,
    UserChatFieldModule,
    FieldModule,
    FormsModule,
    //DropdownModule,
    DropdownModule,
    BadgeModule,
    CheckboxModule,
    ComboboxModule,
    TagModule,
    //Button
    ButtonModule,
    //Sidebar
    SidebarModule,
    ScrollingModule,
    ChatHighlighterModule,
    StoreModule.forFeature('gptAssistantState', gptAssistantState),
    RouterModule.forChild(routes)
  ],
  exports: [CopilotAssistantProjectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CopilotAssistantProjectModule { }
