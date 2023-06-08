import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService, DataService } from '../shared';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  data$!: Observable<any>;

  constructor(
    private router: Router,
    private dataService: DataService,
    private authService: AuthenticationService
  ) { }

  loadData() {
    this.data$ = this.dataService.getData();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
