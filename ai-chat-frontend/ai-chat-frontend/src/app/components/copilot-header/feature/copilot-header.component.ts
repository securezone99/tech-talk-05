import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { KeycloakGuard } from '../../../services/keycloak/keycloak-guard.service';
import { Router } from '@angular/router';

import { ApplicationUser } from 'src/app/shared/models/user/user.model';
import { Observable, combineLatest, map } from 'rxjs';
import { selectUser, selectIsLoading } from 'src/app/shared/store/selectors';

import * as MainActions from 'src/app/shared/store/actions';
import { MainProjectStore } from 'src/app/shared/store/interface';
import { Store, select } from '@ngrx/store';
import { StateClearingService } from 'src/app/shared/store/state-clearing.service';
import { TokenService } from 'src/app/services/keycloak/token-refresh.service';
import { GptAssistantProjectStore } from '../../projects/copilot-assistent-project/data-access/store/interface';
import { setSidebarIndex, setWizzardState } from '../../projects/copilot-assistent-project/data-access/store/actions';

// Websocket
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';
import { GptModel } from 'src/app/shared/models/gpt-model.model';
import { WebsocketAction } from 'src/app/shared/models/websocket/websocket-action';
import { WizzardState } from 'src/app/shared/models/wizzard-state.model';

@Component({
  selector: 'app-copilot-header',
  templateUrl: './copilot-header.component.html',
  styleUrls: ['./copilot-header.component.scss']
})
export class CopilotHeaderComponent implements OnInit, OnDestroy {

  @Output() resetView: EventEmitter<void> = new EventEmitter<void>();

  public user: Observable<ApplicationUser> | undefined;
  public isAdmin: boolean;
  public isLoading$: Observable<boolean>
  private visibilityHandler: () => void;

  // Dropdown
  public title: string = "Select Use Case";
  public selectedProject = { value: 'project0', label: 'GPT Assistant', badgeValue: 'New' };
  public projectList: any[] = [
    { value: 'project0', label: 'Extraction', disabled: true, badgeValue: 'New' },
    { value: 'project1', label: 'Analyzer', disabled: true },
    { value: 'project2', label: 'Similarity Search', disabled: true },
    { value: 'project3', label: 'GPT Assistant', disabled: true, badgeValue: 'New' },
  ];

  constructor(
    private gptAssistantProjectState: Store<GptAssistantProjectStore>,
    private readonly keycloakGuard: KeycloakGuard,
    private readonly router: Router,
    private mainProjectStore: Store<MainProjectStore>,
    private stateClearingService: StateClearingService,
    private tokenService: TokenService,
    private webSocketService: WebSocketService
  ) {
    this.user = this.mainProjectStore.pipe(select(selectUser));
    this.isLoading$ = combineLatest([
      this.mainProjectStore.select(selectIsLoading),
    ]).pipe(map(([isLoading]) => isLoading));

    this.user?.subscribe((user) => {
      this.isAdmin = user.isAdmin;
      this.updateProjectList(this.isAdmin);
    });
  }

  ngOnInit(): void {
    this.mainProjectStore.dispatch(MainActions.setUser({ user: this.keycloakGuard.createUser() }));
    this.visibilityHandler = () => this.tokenService.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  updateProjectList(isAdmin: boolean): void {
    this.projectList = [
      { value: 'project0', label: 'Extraction', disabled: false, badgeValue: 'New' },
      { value: 'project1', label: 'Analyzer', disabled: !isAdmin },
      { value: 'project2', label: 'Similarity Search', disabled: !isAdmin },
      { value: 'project3', label: 'GPT Assistant', disabled: false, badgeValue: 'New' },
    ];
  }

  onDropdownSelectItem(event: any): void {
    // Clear State when switching between projects
    this.stateClearingService.clearAllStates();
    let selectedPrototype = event.selected.label;
    switch (selectedPrototype) {
      case 'GPT Assistant':
        this.router.navigate(['/gpt_assistant']);
        break;
    }
  }

  setAriaLabel(item: any): string {
    const prefixLabel = item.iconName ? `Icon ${item.iconName}, ` : '';
    const label = item.label || '';
    const badgeLabel = item.badgeValue ? `, Badge ${item.badgeValue}` : '';
    const suffixLabel = item.descValue ? `, ${item.descValue}` : '';
    return prefixLabel + label + badgeLabel + suffixLabel;
  }
  // Dropdown End

  showPermissionList = false;

  togglePermissionList(): void {
    this.showPermissionList = !this.showPermissionList;
  }

  selectedLicense: any;
  showLicenseDropdown = false;

  toggleLicenseDropdown(): void {
    this.showLicenseDropdown = !this.showLicenseDropdown;
  }

  hideLicenseDropdown(): void {
    this.showLicenseDropdown = false;
  }

  onClickButton(event: any) {
  }

  public onClickLogout(): void {
    this.keycloakGuard.logoutKeycloakSession();
  }

  public onClickGoToHome(): void {
    this.gptAssistantProjectState.dispatch(setWizzardState ({ wizzardState: WizzardState.LANDING_PAGE }));
    // this.gptAssistantProjectState.dispatch(setSidebarIndex({ sidebarIndex: 0 }));
    this.stateClearingService.clearAllStates();
    this.router.navigateByUrl('/');
    this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATIONS);
  }


  public onClickGoToMeetup(): void {
    window.open('https://www.meetup.com/de-DE/pwc-tech-talks/');
  }

  public goToKeycloakAdminAccount(): void {
    this.keycloakGuard.goToKeycloakAdminAccount();
  }

  public goToKeycloakAccount(): void {
    this.keycloakGuard.goToKeycloakAccount();
  }

  public onClickGoToTutorials(): void {
    window.open('https://sites.google.com/pwc.com/ali/tutorials', '_blank');
  }

  public onClickGoToOGC(): void {
    window.open('https://yoda.pwc.de/pages/ogc-rm-intellectual-property/apps/content/ip-generative-ai', '_blank');
  }

  public onClickGoToLicence(): void {
    this.router.navigateByUrl('/licence');
  }

  public onClickGoToPrivacyNotice(): void {
    this.router.navigateByUrl('/privacy-notice');
  }

  public onClickLogo(): void {
    this.stateClearingService.clearAllStates();
    this.router.navigateByUrl('/');
    this.webSocketService.sendMessage(WebsocketAction.GET_CONVERSATIONS);
  }

}
