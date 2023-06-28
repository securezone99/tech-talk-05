import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { ApplicationUser } from 'src/app/shared/models/user/user.model';
import { environment } from 'src/environments/environment';
import { TokenService } from './token-refresh.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class KeycloakGuard extends KeycloakAuthGuard {

  constructor(
    protected override readonly router: Router,
    readonly keycloakService: KeycloakService,
    private tokenService: TokenService,
    private http: HttpClient

  ) {
    super(router, keycloakService);
    this.tokenService.setupTokenRefresh();
  }


  //return keycloak token
  public getToken(): string | undefined{
    return this.keycloakService.getKeycloakInstance().token;
  }



  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloakService.login({
        redirectUri: window.location.origin + state.url
      });
    }

    // Get the roles required from the route.
    const requiredRoles = route.data['roles'];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.every((role) => this.roles.includes(role));
  }

  public async goToKeycloakAdminAccount() {
    window.open(environment.authentication.keycloakAuthenticationUrl + '/admin/' + environment.authentication.keycloakRealm + '/console/#/' + environment.authentication.keycloakRealm + '/users', '_blank');
  }
  public async goToKeycloakAccount() {
    window.open(environment.authentication.keycloakAuthenticationUrl + '/realms/' + environment.authentication.keycloakRealm + '/account/#/', '_blank');
  }

  public logout(): void {
    this.keycloakService.logout();
  }


  public async logoutKeycloakSession(): Promise<void> {
    const keycloak = this.keycloakService.getKeycloakInstance();
    const refreshToken = keycloak.refreshToken;

    if (!refreshToken) {
      console.error('No refresh token found. Unable to perform Keycloak session logout.');
      return;
    }

    const logoutEndpoint = `${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/logout`;
    const clientId = keycloak.clientId || '';

    const body = new URLSearchParams();
    body.set('client_id', clientId);
    body.set('refresh_token', refreshToken);

    try {
      const response$ = this.http.post(logoutEndpoint, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        responseType: 'text'
      });
      await firstValueFrom(response$);

      // Redirect to an external URL to ensure that the Keycloak session is completely removed.
      window.location.href = environment.authentication.pwcIdentityLogoutUrl;

    } catch (error) {
      console.error('Error logging out of Keycloak session:', error);
    }
  }

  // check if user has admin role
  public isAdmin(): boolean {
    return this.keycloakService.getUserRoles().includes('admin');
  }

  public createUser(): ApplicationUser {
    const firstName = this.keycloakService.getKeycloakInstance().profile?.firstName ?? '';
    const lastName = this.keycloakService.getKeycloakInstance().profile?.lastName ?? '';

    // Get unique roles by converting the roles array to a Set and then back to an array
    const uniqueRoles = Array.from(new Set(this.keycloakService.getUserRoles()));

    let user: ApplicationUser = {
      userId: this.keycloakService.getKeycloakInstance().profile?.id ?? '',
      username: this.keycloakService.getKeycloakInstance().profile?.username ?? '',
      firstName: firstName,
      lastName: lastName,
      initials: `${firstName?.[0] ?? '?'}${lastName?.[0] ?? '?'}`.toUpperCase(),
      email: this.keycloakService.getKeycloakInstance().profile?.email ?? '',
      isAdmin: this.isAdmin(),
      emailVerified: this.keycloakService.getKeycloakInstance().profile?.emailVerified ?? false,
      roles: uniqueRoles
    }
    return user;
  }

}
