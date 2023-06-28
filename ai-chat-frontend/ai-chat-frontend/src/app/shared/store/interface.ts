import { ApplicationUser } from '../../shared/models/user/user.model';
import { BackendMessage } from '../models/message/backend-message.model';

export interface MainState {
  isLoading: boolean;
  backendMessage: BackendMessage;
  user: ApplicationUser;
  isWebsocketConnected: boolean;
}

export interface MainProjectStore {
    mainState: MainState;
}
