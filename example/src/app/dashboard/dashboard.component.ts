import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { AuthService } from '../ngx-auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  protected data = signal([]);

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  protected loadData() {
    this.http.get('http://localhost:3000/data')
      .subscribe((data: any[]) => this.data.set(data));
  }

  protected async logout() {
    await this.authService.logout();
  }
}
