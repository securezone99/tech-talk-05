import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AssistantActions from 'src/app/components/projects/copilot-assistent-project/data-access/store/actions';
import { GptAssistantProjectStore } from 'src/app/components/projects/copilot-assistent-project/data-access/store/interface'; './data-access/store/interface/pdf-renderer-project-store.interface';


@Injectable({
  providedIn: 'root'
})

export class StateClearingService {

  constructor(
    private gptAssistantProjectStore: Store<GptAssistantProjectStore>
  ) { }

  public clearAllStates(): void {
    this.gptAssistantProjectStore.dispatch(AssistantActions.clearGptAssistantState());
  }

}
