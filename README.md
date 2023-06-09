# Angular 16+ Authentication

This package provides authentication module with interceptor

```
npm install ngx-auth --save
```

For older versions of angular see [Older Versions](#older-versions) section.

## Full example
Full example you can find in the [example folder](example).

## Authentication module

Authentication modules provides ability to attach authentication token automatically to the headers
(through http interceptors), refresh token functionality, guards for protected or public pages and more.

#### Usage

1. Import `AuthService` interface to implement it with your custom Authentication service, e.g.:

```typescript
import { AuthService } from 'ngx-auth';

@Injectable()
export class AuthenticationService implements AuthService {
  private interruptedUrl: string;

  constructor(private http: Http) {}

  isAuthorized() {
    const isAuthorized = !!sessionStorage.getItem('accessToken');

    return of(isAuthorized);
  }

  getAccessToken() {
    const accessToken = sessionStorage.getItem('accessToken');

    return of(accessToken);
  }

  refreshToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');

    return this.http
      .post('http://localhost:3001/refresh-token', { refreshToken })
      .catch(() => this.logout())
  }

  refreshShouldHappen(response: HttpErrorResponse) {
    return response.status === 401;
  }

  verifyRefreshToken(req: HttpRequest<any>) {
    return req.url.endsWith('refresh-token');
  }

  skipRequest(req: HttpRequest<any>) {
    return req.url.endsWith('third-party-request');
  }

  getInterruptedUrl() {
    return this.interruptedUrl;
  }

  setInterruptedUrl(url: string) {
    this.interruptedUrl = url;
  }

}
```

2. Specify functions `publicGuard` for public routes and `protectedGuard` for protected respectively, e.g.:

```typescript
const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    canActivate: [publicGuard],
    children: [/*...*/],
  },
  {
    path: '',
    component: ProtectedComponent,
    canActivate: [protectedGuard],
    children: [/*...*/],
  }
];
```

2. Create additional `AuthenticationModule` and provide important providers and imports, e.g.:

```typescript
import { NgModule } from '@angular/core';
import { AuthModule, AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI, PROTECTED_FALLBACK_PAGE_URI } from 'ngx-auth';

import { AuthenticationService } from './authentication.service';

@NgModule({
  imports: [ AuthModule ],
  providers: [
    { provide: PROTECTED_FALLBACK_PAGE_URI, useValue: '/' },
    { provide: PUBLIC_FALLBACK_PAGE_URI, useValue: '/login' },
    { provide: AUTH_SERVICE, useClass: AuthenticationService }
  ]
})
export class AuthenticationModule { }
```

where,
* `PROTECTED_FALLBACK_PAGE_URI` - main protected page to be redirected to, in case if user will reach public route, that is protected
by `publicGuard` and will be authenticated

* `PUBLIC_FALLBACK_PAGE_URI` - main public page to be redirected to, in case if user will reach protected route, that is protected
by `protectedGuard` and won't be authenticated

* `AUTH_SERVICE` - Authentication service token providers

3. Provide your `AuthenticationModule` in your `AppModule`

### Customizing authentication headers

By default, requests are intercepted and a `{ Authorization: 'Bearer ${token}'}` header is injected. To customize this behavior, implement the `getHeaders` method on your `AuthenticationService`

### After login redirect to the interrupted URL

The `AuthService` has an optional method `setInterruptedUrl` which saves the URL that was requested before the user is redirected to the login page. This property can be used in order to redirect the user to the originally requested page after he logs in. E.g. in your `login.component.ts` (check also `AuthService` implementation above):

```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  login() {
    this.authService.login()
      .subscribe(() =>
        this.router.navigateByUrl(this.authService.getInterruptedUrl())
      );
  }
}
```

## Older Versions
For angular 7-15, use version 5.4.0
```
npm install ngx-auth@5.4.0 --save
```

For angular 6, use version 4.1.0
```
npm install ngx-auth@4.1.0 --save
```

For angular 5, use version 3.1.0
```
npm install ngx-auth@3.1.0 --save
```

For angular 4, use version 2.2.0
```
npm install ngx-auth@2.2.0 --save
```
