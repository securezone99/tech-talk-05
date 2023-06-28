import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { LoadingComponent } from './loading.component';
import { FeedModule } from '@appkit4/angular-components/feed';
import { RouterModule } from '@angular/router';
import { LoadingModule} from '@appkit4/angular-components/loading';

@NgModule({
  declarations: [LoadingComponent],
  imports: [
    FeedModule,
    RouterModule,
    LoadingModule

  ],
  exports: [LoadingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CopilotLoadingModule { }
