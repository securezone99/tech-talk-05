import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor(private keycloakService: KeycloakService) {
        this.setupTokenRefresh();
    }

    public setupTokenRefresh(): void {
        setInterval(() => {
            console.log('Token refresh');
            this.keycloakService.updateToken(60)
                .then((refreshed) => {
                    if (refreshed) {
                        console.log('Token refreshed');
                    }
                })
                .catch(() => {
                    console.log('Failed to refresh token');
                });
        }, 300000); // 5 minutes
    }

    // get keycloak instance
    public getKeycloakInstance(): any {
        return this.keycloakService.getKeycloakInstance();
    }

    // update token when user is active again (e.g. after tab change)
    public updateToken(minValidity?: number): Promise<boolean> {
        return this.keycloakService.updateToken(minValidity);
    }

    // refresh token when user is active again (e.g. after tab change)
    public async handleVisibilityChange() {
        if (document.visibilityState === 'visible') {;
            const keycloakInstance = this.keycloakService.getKeycloakInstance();
            const tokenExpiration = keycloakInstance.tokenParsed?.exp;
            const currentTime = new Date().getTime() / 1000; // Convert to seconds

            if (tokenExpiration && currentTime > tokenExpiration) {
                console.log('currentTime > tokenExpiration');
                try {
                    await this.keycloakService.updateToken(0); // Force token refresh
                } catch (error) {
                    console.log('Error refreshing token', error);
                }
            }
        }
    }

}
