import { TestBed, inject, async } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { of as ObservableOf } from 'rxjs';

import { AUTH_SERVICE, PROTECTED_FALLBACK_PAGE_URI } from './tokens';
import { AuthService } from './auth.service';
import { PublicGuard } from './public.guard';

const RouterStub = {
  navigateByUrl() { }
};

const AuthenticationServiceStub = {
  isAuthorized() {}
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
      ]
    });
  });

  beforeEach(inject(
    [PublicGuard, Router, AUTH_SERVICE],
    (_publicGuard: PublicGuard, _router: Router, _authService: AuthService ) => {
      publicGuard = _publicGuard;
      router = _router;
      authService = _authService;

      spyOn(router, 'navigateByUrl').and.callThrough();
    }
  ));

  it('should instantiate guard', () => {
    expect(publicGuard).toBeTruthy();
  });

  it('should activate public route for not authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue( ObservableOf(false) );

    publicGuard
      .canActivate(null, <RouterStateSnapshot>{ url: RESET_PAGE })
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

  it('should not activate public route for authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue( ObservableOf(true) );

    publicGuard
      .canActivate(null, <RouterStateSnapshot>{ url: RESET_PAGE })
      .subscribe(
        status => {
          expect(status).toBeFalsy();
          expect(router.navigateByUrl).toHaveBeenCalledWith( HOME_PAGE );
        },
        () => {
          throw new Error('should not be called');
        }
      );
  }));

});
