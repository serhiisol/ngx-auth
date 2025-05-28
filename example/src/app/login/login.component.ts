import { Component, inject } from '@angular/core';

import { AuthService } from '../ngx-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);

  protected login() {
    this.authService.login().subscribe();
  }
}
