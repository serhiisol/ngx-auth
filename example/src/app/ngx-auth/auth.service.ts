import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxAuthService } from 'ngx-auth';
import { of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { TokenStorage } from './token-storage.service';

interface AccessData {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements NgxAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorage);

  getAccessToken() {
    const token = this.tokenStorage.getAccessToken();

    return of(token);
  }

  isAuthenticated() {
    return this.getAccessToken().pipe(map(token => !!token));
  }

  login() {
    return this.http.post<AccessData>('http://localhost:3000/login', {})
      .pipe(
        tap(async (tokens: AccessData) => {
          this.saveAccessData(tokens);
          await this.router.navigateByUrl('/');
        }),
      );
  }

  async logout() {
    this.tokenStorage.clear();
    await this.router.navigateByUrl('/');
    location.reload();

  }

  refreshShouldHappen(response: HttpErrorResponse) {
    return response.status === 401;
  }

  refreshToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();

    return this.http.post<AccessData>('http://localhost:3000/refresh', { refreshToken }).pipe(
      tap((tokens: AccessData) => this.saveAccessData(tokens)),
      catchError(async (err) => {
        await this.logout();

        return throwError(() => err);
      }),
    );
  }

  skipRequest(req: HttpRequest<any>) {
    return req.url.endsWith('/refresh');
  }

  private saveAccessData({ accessToken, refreshToken }: AccessData) {
    this.tokenStorage.setAccessToken(accessToken);
    this.tokenStorage.setRefreshToken(refreshToken);
  }
}
