import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'generative-ai-chat', pathMatch: 'full' },
  {
    path: 'generative-ai-chat',
    loadChildren: () => import('./components/projects/copilot-assistent-project/feature/copilot-assistant-project.module').then(m => m.CopilotAssistantProjectModule)
  },
  {
    path: '',
    loadChildren: () => import('./components/license-privacy/static.module').then(m => m.StaticModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]})

export class AppRoutingModule { }
