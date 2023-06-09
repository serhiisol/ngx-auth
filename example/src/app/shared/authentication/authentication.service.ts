import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'ngx-auth';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { TokenStorage } from './token-storage.service';

interface AccessData {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthenticationService implements AuthService {
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage
  ) { }

  isAuthorized() {
    return this.getAccessToken().pipe(map(token => !!token));
  }

  getAccessToken() {
    const token = this.tokenStorage.getAccessToken();

    return of(token);
  }

  refreshToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();

    return this.http.post<AccessData>('http://localhost:3000/refresh', { refreshToken }).pipe(
      tap((tokens: AccessData) => this.saveAccessData(tokens)),
      catchError((err) => {
        this.logout();

        return throwError(() => err);
      })
    );
  }

  refreshShouldHappen(response: HttpErrorResponse) {
    return response.status === 401;
  }

  verifyRefreshToken(req: HttpRequest<any>) {
    return req.url.endsWith('/refresh');
  }

  login(): Observable<any> {
    return this.http.post<AccessData>('http://localhost:3000/login', {})
      .pipe(tap((tokens: AccessData) => this.saveAccessData(tokens)));
  }

  logout(): void {
    this.tokenStorage.clear();
    location.reload();
  }

  private saveAccessData({ accessToken, refreshToken }: AccessData) {
    this.tokenStorage.setAccessToken(accessToken);
    this.tokenStorage.setRefreshToken(refreshToken);
  }
}
