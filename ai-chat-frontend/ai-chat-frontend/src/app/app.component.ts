import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  public config = environment;

  // Footer
  public footerContent: string = "";
  public footerType: string = 'text';
  public shouldShowFooter$: Observable<boolean>;
}
