import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { ProtectedGuard } from './protected.guard';
import { AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI } from './tokens';

const RouterStub = {
  navigateByUrl() { },
};

const AuthenticationServiceStub = {
  isAuthorized() { },
  setInterruptedUrl() { },
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
      ],
    });
  });

  beforeEach(inject(
    [ProtectedGuard, Router, AUTH_SERVICE],
    (_authGuard: ProtectedGuard, _router: Router, _authService: AuthService) => {
      protectedGuard = _authGuard;
      router = _router;
      authService = _authService;
    }
  ));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(router, 'navigateByUrl');
  });

  it('should instantiate guard', () => {
    expect(protectedGuard).toBeTruthy();
  });

  it('should not activate auth route for a not authenticated user', waitForAsync(() => {
    jest.spyOn(authService, 'isAuthorized').mockReturnValue(of(false));

    protectedGuard
      .canActivate({ url: DASHBOARD_PAGE } as RouterStateSnapshot)
      .subscribe({
        next: status => {
          expect(status).toBeFalsy();
          expect(router.navigateByUrl).toHaveBeenCalledWith(LOGIN_PAGE);
        },
        error: () => {
          throw new Error('should not be called');
        },
      });
  }));

  it('should activate auth route for authenticated user', waitForAsync(() => {
    jest.spyOn(authService, 'isAuthorized').mockReturnValue(of(true));

    protectedGuard
      .canActivate({ url: DASHBOARD_PAGE } as RouterStateSnapshot)
      .subscribe({
        next: status => {
          expect(status).toBeTruthy();
          expect(router.navigateByUrl).not.toHaveBeenCalled();
        },
        error: () => {
          throw new Error('should not be called');
        },
      });
  }));

  it('should set the interrupted URL before user gets redirected to the fallback page', waitForAsync(() => {
    jest.spyOn(authService, 'isAuthorized').mockReturnValue(of(false));
    jest.spyOn(authService, 'setInterruptedUrl');

    protectedGuard
      .canActivate({ url: DASHBOARD_PAGE } as RouterStateSnapshot)
      .subscribe({
        next: () => expect(authService.setInterruptedUrl).toHaveBeenCalledWith(DASHBOARD_PAGE),
        error: () => {
          throw new Error('should not be called');
        },
      });
  }));

});
