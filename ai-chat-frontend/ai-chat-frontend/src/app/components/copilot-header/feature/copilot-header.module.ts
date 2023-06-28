import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopilotHeaderComponent } from './copilot-header.component';
import { HeaderModule } from '@appkit4/angular-components/header';
import { AvatarModule } from '@appkit4/angular-components/avatar';
import { DropdownModule} from '@appkit4/angular-components/dropdown';
import { BadgeModule } from "@appkit4/angular-components/badge";
import { CheckboxModule } from "@appkit4/angular-components/checkbox";
import { ComboboxModule } from "@appkit4/angular-components/combobox";
import { TagModule } from "@appkit4/angular-components/tag";
import { FormsModule } from "@angular/forms";
import { CopilotLoadingModule } from '../../shared/loading/loading.module';

@NgModule({
  declarations: [CopilotHeaderComponent],
  imports: [
    CommonModule,
    // HeaderModule,
    HeaderModule,
    // AvatarModule,
    AvatarModule,
    // DropdownModule,
    DropdownModule,
    BadgeModule,
    CheckboxModule,
    ComboboxModule,
    TagModule,
    FormsModule,
    //Loading
    CopilotLoadingModule

  ],
  exports: [CopilotHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CopilotHeaderModule { }
