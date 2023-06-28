import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentComponent } from './comment.component';
import { FeedModule } from '@appkit4/angular-components/feed';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [CommentComponent],
  imports: [
    CommonModule,
    FeedModule,
    RouterModule

  ],
  exports: [CommentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommentModule { }
