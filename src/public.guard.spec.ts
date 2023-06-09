import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { PublicGuard } from './public.guard';
import { AUTH_SERVICE, PROTECTED_FALLBACK_PAGE_URI } from './tokens';

const RouterStub = {
  navigateByUrl() { },
};

const AuthenticationServiceStub = {
  isAuthorized() { },
};

const HOME_PAGE = '/';
const RESET_PAGE = '/reset';

describe('PublicGuard', () => {
  let publicGuard: PublicGuard;
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicGuard,
        { provide: Router, useValue: RouterStub },
        { provide: AUTH_SERVICE, useValue: AuthenticationServiceStub },
        { provide: PROTECTED_FALLBACK_PAGE_URI, useValue: HOME_PAGE },
      ],
    });
  });

  beforeEach(inject(
    [PublicGuard, Router, AUTH_SERVICE],
    (_publicGuard: PublicGuard, _router: Router, _authService: AuthService) => {
      publicGuard = _publicGuard;
      router = _router;
      authService = _authService;
    }
  ));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(router, 'navigateByUrl');
  });

  it('should instantiate guard', () => {
    expect(publicGuard).toBeTruthy();
  });

  it('should activate public route for not authenticated user', waitForAsync(() => {
    jest.spyOn(authService, 'isAuthorized').mockReturnValue(of(false));

    publicGuard
      .canActivate({ url: RESET_PAGE } as RouterStateSnapshot)
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

  it('should not activate public route for authenticated user', waitForAsync(() => {
    jest.spyOn(authService, 'isAuthorized').mockReturnValue(of(true));

    publicGuard
      .canActivate({ url: RESET_PAGE } as RouterStateSnapshot)
      .subscribe({
        next: status => {
          expect(status).toBeFalsy();
          expect(router.navigateByUrl).toHaveBeenCalledWith(HOME_PAGE);
        },
        error: () => {
          throw new Error('should not be called');
        },
      });
  }));

});
