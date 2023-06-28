import { createSelector } from "@ngrx/store";
import { MainProjectStore } from "./interface";

export const selectFeature = (state: MainProjectStore) => state.mainState;

export const selectIsLoading = createSelector(selectFeature, (state) => state.isLoading);
export const selectBackenMessage= createSelector(selectFeature, (state) => state.backendMessage);
export const selectUser = createSelector(selectFeature, (state) => state.user);
export const selectIsWebsocketConnected = createSelector(selectFeature, (state) => state.isWebsocketConnected);
