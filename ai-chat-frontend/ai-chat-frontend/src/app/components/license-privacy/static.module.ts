import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenceTextComponent } from './licence/licence-text.component';
import { PrivacyNoticeComponent } from './privacy-notice/privacy-notice.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'licence', component: LicenceTextComponent },
  { path: 'privacy-notice', component: PrivacyNoticeComponent },
];

@NgModule({
  declarations: [
    LicenceTextComponent,
    PrivacyNoticeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    LicenceTextComponent,
    PrivacyNoticeComponent,
  ],
})
export class StaticModule {}
