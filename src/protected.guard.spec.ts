import { TestBed, inject, async } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI } from './tokens';
import { AuthService } from './auth.service';
import { ProtectedGuard } from './protected.guard';

const RouterStub = {
  navigateByUrl() { }
};

const AuthenticationServiceStub = {
  isAuthorized() {}
};

const LOGIN_PAGE = '/login';
const DASHBOARD_PAGE = '/dashboard';

describe('ProtectedGuard', () => {
  let protectedGuard: ProtectedGuard;
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProtectedGuard,
        { provide: Router, useValue: RouterStub },
        { provide: AUTH_SERVICE, useValue: AuthenticationServiceStub },
        { provide: PUBLIC_FALLBACK_PAGE_URI, useValue: LOGIN_PAGE },
      ]
    });
  });

  beforeEach(inject(
    [ProtectedGuard, Router, AUTH_SERVICE],
    (_authGuard: ProtectedGuard, _router: Router, _authService: AuthService) => {
      protectedGuard = _authGuard;
      router = _router;
      authService = _authService;

      spyOn(router, 'navigateByUrl').and.callThrough();
    }
  ));

  it('should instantiate guard', () => {
    expect(protectedGuard).toBeTruthy();
  });

  it('should not activate auth route for a not authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue(of(false));

    protectedGuard
      .canActivate(null, <RouterStateSnapshot>{ url: DASHBOARD_PAGE })
      .subscribe(
        status => {
          expect(status).toBeFalsy();
          expect(router.navigateByUrl).toHaveBeenCalledWith(LOGIN_PAGE);
        },
        () => {
          throw new Error('should not be called');
        }
      );
  }));

  it('should activate auth route for authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue(of(true));

    protectedGuard
      .canActivate(null, <RouterStateSnapshot>{ url: DASHBOARD_PAGE })
      .subscribe(
        status => {
          expect(status).toBeTruthy();
          expect(router.navigateByUrl).not.toHaveBeenCalled();
        },
        () => {
          throw new Error('should not be called');
        }
      );
  }));

  it('should fill the interrupted URL before user gets redirected to the ', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue(of(false));

    expect(protectedGuard.lastInterruptedUrl).toBe(undefined);

    protectedGuard
      .canActivate(null, <RouterStateSnapshot>{ url: DASHBOARD_PAGE })
      .subscribe(
        () => expect(protectedGuard.lastInterruptedUrl).toBe(DASHBOARD_PAGE),
        () => {
          throw new Error('should not be called');
        }
      );
  }));

});
