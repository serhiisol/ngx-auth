import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'ngx-root',
  template: '<router-outlet />',
})
export class AppComponent { }
