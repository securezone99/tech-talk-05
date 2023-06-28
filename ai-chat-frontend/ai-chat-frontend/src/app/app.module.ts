// Angular Basic
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
// Keycloak
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';
// Redux
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// Custom Modules
import { CopilotHeaderModule } from './components/copilot-header/feature/copilot-header.module';
import { FooterModule } from '@appkit4/angular-components/footer';
import { CopilotNotificationModalModule } from './components/shared/copilot-notification-modal/copilot-notification-modal.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { mainReducers } from './shared/store/reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

// Keycloak initialization
function initializeKeycloak(keycloakService: KeycloakService) {
  return () =>
    keycloakService.init({
      config: {
        url: environment.authentication.keycloakAuthenticationUrl,
        realm: environment.authentication.keycloakRealm,
        clientId: environment.authentication.keycloakClientId
      },
      initOptions: {
        checkLoginIframe: false,
        onLoad: "login-required",
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      },
      loadUserProfileAtStartUp: true,
    });
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    //Angular Basic
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    // Keycloak
    KeycloakAngularModule,
    // Basic
    CopilotHeaderModule,
    FooterModule,
    CopilotNotificationModalModule,
    // GPT Project
    BrowserAnimationsModule, // Lazy Loading needs this BrowserModule extension in root module
    PdfViewerModule,
    StoreModule.forFeature('mainState', mainReducers),
    //RxJs
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          java: () => import('highlight.js/lib/languages/java'),
          python: () => import('highlight.js/lib/languages/python'),
        },
        themePath: 'assets/styles/dark.css'
      }
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
