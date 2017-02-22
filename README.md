# Angular 2/4 Http Interceptors and Authentication

This package provides two major missing features in angular2: Http Interceptors and Authentication.

## Http Interceptors

Http Interceptors provides you ability to intercept all requests and modify then, if necessary or 
retry them again.

#### Usage

1. Import ```Interceptor``` interface from the package and create and provide your own Interceptor, e.g.:

```typescript
import { Interceptor } from 'ng2-http-auth/http';

@Injectable()
export class CustomInterceptor implements Interceptor {

  constructor(private http: Http) {}

  /**
   * Request interceptor.
   * @param {Request|string} url
   * @param {RequestOptionsArgs} options
   * @returns {Observable}
   */
  public request({ url, options }: RequestInterceptorOptions): RequestInterceptorOptions {
    const urlString = url instanceof Request ? (<Request>url).url : url;

    console.log('Request:', urlString);

    return { url, options };
  }

  public responseError({ url, options, response }: ResponseInterceptorOptions): RequestInterceptorOptions {
    const urlString = url instanceof Request ? (<Request>url).url : url;
    console.log('Response:', urlString);

    return { url, options, response };
  }
}
```

2. Register your custom interceptor by injecting ```InterceptorStore``` into your module, e.g.:

```typescript
import { InterceptorStore } from 'ng2-http-auth/http';

@NgModule({
  providers: [ CustomInterceptor ]
})
export class AuthModule {
  constructor(interceptorStore: InterceptorStore, customInterceptor: CustomInterceptor) {
    interceptorStore.register(customInterceptor);
  }
}
```

3. Use ```HttpModule``` and ```Http``` service from the package instead of native one, e.g.:

```typescript
import { HttpModule } from 'ng2-http-auth/http';

@NgModule({
  imports: [ HttpModule ]
})
export class AuthModule {
}

```

## Authentication module

Authentication modules provides ability to attach authentication token automatically to the headers
(through http interceptors), refresh token functionality, guards for protected or public pages and more.

#### Usage

1. Import ```AuthService``` interface to implement it with your custom Authentication service, e.g.:

```typescript
import { AuthService } from 'ng2-http-auth/auth';

@Injectable()
export class AuthenticationService implements AuthService {

  constructor(private http: Http) {
  }

  isAuthorized(): Observable<boolean> {
    const isAuthorized: boolean = !!localStorage.getItem('accessToken');

    return Observable.of(isAuthorized);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    location.reload(true);
  }

  getAccessToken(): Observable<string> {
    const accessToken: string = localStorage.getItem('accessToken');

    return Observable.of(accessToken);
  }

  refreshToken(): Observable<any> {
    const refreshToken: string = localStorage.getItem('refreshToken');

    return this.http
      .post('http://localhost:3001/refresh-token', { refreshToken })
      .catch(() => this.logout())
  }

  refreshShouldHappen(response: Response): boolean {
    return response.status === 401;
  }

  isRefreshTokenRequest(url: string): boolean {
    return url.endsWith('refresh-token');
  }

}
```

2. Specify ```PublicGuard``` for public routes and ```ProtectedGuard``` for protected respectively, e.g.:

```typescript
const publicRoutes: Routes = [
  { path: '', component: LoginComponent, canActivate: [ PublicGuard ] }
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
import { AuthModule, AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI, PROTECTED_FALLBACK_PAGE_URI } from 'ng2-http-auth/auth';

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