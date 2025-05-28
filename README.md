# Angular 20+ Authentication

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
1. Import `NgxAuthService` interface to implement it with your custom Authentication service, e.g.:
2. Specify functions `ngxPublicGuard` for public routes and `ngxProtectedGuard` for protected respectively, e.g.:
3. Use `provideNgxAuthProviders` to provide `NgxAuthService` implementation and `protectedRedirectUri`, `publicRedirectUri` redirect uris

### Customizing authentication headers
By default, requests are intercepted and a `{ Authorization: 'Bearer ${token}'}` header is injected. To customize this behavior, implement the `getHeaders` method on your `NgxAuthService`

### After login redirect to the interrupted URL
The `NgxAuthService` has an optional method `setInterruptedUrl` which saves the URL that was requested before the user is redirected to the login page. This property can be used in order to redirect the user to the originally requested page after he logs in.


## Older Versions
For angular 16-19, use version 6.0.0
```
npm install ngx-auth@5.4.0 --save
```
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
