import { TestBed, inject, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { AUTH_SERVICE } from '../tokens';
import { AuthService } from '../auth.service';
import { AuthGuard } from './auth.guard';
import { ActivatedRouteSnapshot } from '@angular/router/src/router_state';

const AuthenticationServiceStub = {
  isAuthorized() {},
  goToLoginPage() {}
};

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AUTH_SERVICE, useValue: AuthenticationServiceStub }
      ]
    });
  });

  beforeEach(inject(
    [AuthGuard, AUTH_SERVICE],
    (_authGuard: AuthGuard, _authService: AuthService ) => {
      authGuard = _authGuard;
      authService = _authService;

      spyOn(authService, 'goToLoginPage').and.callThrough();
    }
  ));

  it('should instantiate guard', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should not activate auth route for a not authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue( Observable.of(false) );

    authGuard
      .canActivate(<ActivatedRouteSnapshot>{})
      .subscribe(
        status => {
          expect(status).toBeFalsy();
          expect(authService.goToLoginPage).toHaveBeenCalledWith();
        },
        () => {
          throw new Error('should not be called');
        }
      );
  }));

  it('should activate auth route for authenticated user', async(() => {
    spyOn(authService, 'isAuthorized').and.returnValue( Observable.of(true) );

    authGuard
      .canActivate(<ActivatedRouteSnapshot>{})
      .subscribe(
        status => {
          expect(status).toBeTruthy();
          expect(authService.goToLoginPage).not.toHaveBeenCalled();
        },
        () => {
          throw new Error('should not be called');
        }
      );
  }));

});
