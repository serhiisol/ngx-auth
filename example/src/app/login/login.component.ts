import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) { }

  login() {
    this.authService.login()
      .subscribe(() => this.router.navigateByUrl('/'));
  }
}
