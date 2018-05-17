# Angular 6+ Authentication

This package provides authentication module with interceptor

```
npm install ngx-auth --save
```

Note: If you want to use library for angular 5, use version 3.1.0
```
npm install ngx-auth@3.1.0 --save
```

Note: If you want to use library for angular 4, use version 2.2.0
```
npm install ngx-auth@2.2.0 --save
```

## Full example
Full example you can find in this repo [serhiisol/ngx-auth-example](https://github.com/serhiisol/ngx-auth-example)

## Authentication module

Authentication modules provides ability to attach authentication token automatically to the headers
(through http interceptors), refresh token functionality, guards for protected or public pages and more.

#### Usage

1. Import ```AuthService``` interface to implement it with your custom Authentication service, e.g.:

```typescript
import { AuthService } from 'ngx-auth';

@Injectable()
export class AuthenticationService implements AuthService {

  constructor(private http: Http) {}

  public isAuthorized(): Observable<boolean> {
    const isAuthorized: boolean = !!localStorage.getItem('accessToken');

    return Observable.of(isAuthorized);
  }

  public getAccessToken(): Observable<string> {
    const accessToken: string = localStorage.getItem('accessToken');

    return Observable.of(accessToken);
  }

  public refreshToken(): Observable<any> {
    const refreshToken: string = localStorage.getItem('refreshToken');

    return this.http
      .post('http://localhost:3001/refresh-token', { refreshToken })
      .catch(() => this.logout())
  }

  public refreshShouldHappen(response: HttpErrorResponse): boolean {
    return response.status === 401;
  }

  public verifyTokenRequest(url: string): boolean {
    return url.endsWith('refresh-token');
  }

}
```

2. Specify ```PublicGuard``` for public routes and ```ProtectedGuard``` for protected respectively, e.g.:

```typescript
const publicRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [ PublicGuard ]
  }
];
```
```typescript
const protectedRoutes: Routes = [
  {
    path: '',
    component: ProtectedComponent,
    canActivate: [ ProtectedGuard ],
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' }
    ]
  }
];
```

2. Create additional ```AuthenticationModule``` and provide important providers and imports, e.g.:

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
export class AuthenticationModule {

}

```

where,
* ```PROTECTED_FALLBACK_PAGE_URI``` - main protected page to be redirected to, in case if user will reach public route, that is protected
by ```PublicGuard``` and will be authenticated

* ```PUBLIC_FALLBACK_PAGE_URI``` - main public page to be redirected to, in case if user will reach protected route, that is protected
by ```ProtectedGuard``` and won't be authenticated

* ```AUTH_SERVICE``` - Authentication service token providers

3. Provide your ```AuthenticationModule``` in your ```AppModule```

### Customizing authentication headers

By default, requests are intercepted and a ```{ Authorization: 'Bearer ${token}'}``` header is injected. To customize this behavior, implement the ```getHeaders``` method on your ```AuthenticationService```
