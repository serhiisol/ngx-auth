import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpRequest
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';
import { AuthInterceptor } from './auth.interceptor';

const TEST_URI = 'TEST_URI';
const TEST_URI2 = 'TEST_URI_2';
const TEST_SKIP_URI = 'TEST_SKIP_URI';
const TEST_REFRESH_URI = 'TEST_REFRESH_URI';
const TEST_TOKEN = 'TEST_TOKEN';

class AuthenticationServiceStub implements AuthService {
  constructor(private http: HttpClient) {}

  isAuthorized() {
    return of(true);
  }

  getAccessToken() {
    return of(TEST_TOKEN);
  }

  refreshToken() {
    return this.http.get(TEST_REFRESH_URI);
  }

  refreshShouldHappen(e: HttpErrorResponse) {
    return e.status === 401;
  }

  verifyRefreshToken(req: HttpRequest<any>) {
    return req.url.startsWith(TEST_REFRESH_URI);
  }

  skipRequest(req: HttpRequest<any>) {
    return req.url === TEST_SKIP_URI;
  }
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let service: AuthService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        {
          provide: AUTH_SERVICE,
          deps: [HttpClient],
          useClass: AuthenticationServiceStub
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        }
      ]
    });
  });

  beforeEach(inject(
    [ HttpClient, HttpTestingController, AUTH_SERVICE ],
    (
      _http: HttpClient,
      _controller: HttpTestingController,
      _service: AuthService
    ) => {
      http = _http;
      controller = _controller;
      service = _service;
    }
  ));

  describe('with request', () => {

    it('should pass request normally', () => {
      http.get(TEST_URI).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data' });
      }, fail);

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.flush({name: 'Test_Data'});
    });

    it('should skip process for some cases', () => {
      http.get(TEST_SKIP_URI).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data' });
      }, fail);

      const req = controller.expectOne(TEST_SKIP_URI);

      expect(req.request.url).toBe(TEST_SKIP_URI);
      expect(req.request.headers.get('Authorization')).not.toBe(`Bearer ${TEST_TOKEN}`);

      req.flush({name: 'Test_Data'});
    });

  });

  describe('with responseError', () => {

    it('should throw error', () => {
      http.get(TEST_URI).subscribe(fail, e => {
        expect(e.status).toBe(400);
      });

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('400'), { status: 400 });
    });

    it('should trigger refresh request after failed original request and retry original', fakeAsync(() => {
      spyOn(service, 'refreshToken').and.callThrough();

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
      }, fail);

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('401'), { status: 401 });

      controller.expectOne(TEST_REFRESH_URI).flush({});
      controller
        .expectOne(TEST_URI)
        .flush({ name: 'Test_Data' });

      tick(1000);
    }));

  });

  describe('with delaying', () => {

    it('should delay and then retry requests if one of requests fails when refreshShouldHappen', fakeAsync(() => {
      spyOn(service, 'refreshToken').and.callThrough();

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
      }, fail);

      http.get(TEST_URI2).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data2' });
      }, fail);

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      controller
        .expectOne(TEST_URI2)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      controller.expectOne(TEST_REFRESH_URI).flush({});
      controller
        .expectOne(TEST_URI)
        .flush({name: 'Test_Data'});

      controller
        .expectOne(TEST_URI2)
        .flush({name: 'Test_Data2'});

      controller.verify();
    }));

    it('should delay upcoming requests if refresh is in progress', fakeAsync(() => {
      spyOn(service, 'refreshToken').and.callThrough();

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
      }, fail);

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      http.get(TEST_URI2).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data2' });
      }, fail);

      // At this point second request is delayed and won't be registered in http

      controller.expectNone(TEST_URI2);

      tick(500);

      controller.expectOne(TEST_REFRESH_URI).flush({});
      controller
        .expectOne(TEST_URI)
        .flush({name: 'Test_Data'});

      controller
        .expectOne(TEST_URI2)
        .flush({name: 'Test_Data2'});

      controller.verify();
    }));

  });

});

class CustomHeaderAuthenticationServiceStub extends AuthenticationServiceStub {
  public getHeaders(token: string): any {
    return { 'x-auth-token': token };
  }
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        {
          provide: AUTH_SERVICE,
          deps: [HttpClient],
          useClass: CustomHeaderAuthenticationServiceStub
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        }
      ]
    });
  });

  beforeEach(inject(
    [ HttpClient, HttpTestingController ],
    (
      _http: HttpClient,
      _controller: HttpTestingController
    ) => {
      http = _http;
      controller = _controller;
    }
  ));

  describe('with custom headers', () => {
    it('should customize the authorization headers', () => {
      http.get(TEST_URI).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data' });
      }, fail);

      const req = controller.expectOne(TEST_URI);

      expect(req.request.headers.get('x-auth-token')).toBe(TEST_TOKEN);

      req.flush({name: 'Test_Data'});
    });

  });
});
