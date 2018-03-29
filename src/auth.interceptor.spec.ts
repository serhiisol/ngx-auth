import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';
import { AuthInterceptor } from './auth.interceptor';

const TEST_URI = 'TEST_URI';
const TEST_URI2 = 'TEST_URI_2';
const TEST_REFRESH_URI = 'TEST_REFRESH_URI';
const TEST_TOKEN = 'TEST_TOKEN';

function ObservableDelay<T>(val: T, delay: number, cb = () => {}): Observable<any> {
  return new Observable(observer => {
    setTimeout(() => {
      observer.next(val);
      observer.complete();
      cb();
    }, delay);
  });
}

class AuthenticationServiceStub implements AuthService {
  isAuthorized() {
    return of(true);
  }
  getAccessToken() {
    return of(TEST_TOKEN);
  }
  refreshToken() {
    return of(TEST_TOKEN);
  }
  refreshShouldHappen(e: HttpErrorResponse) {
    return e.status === 401;
  }
  verifyTokenRequest(url: string) {
    return url === TEST_REFRESH_URI;
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
      spyOn(service, 'refreshToken').and.returnValue(ObservableDelay(TEST_TOKEN, 1000, () => {
        controller
          .expectOne(TEST_URI)
          .flush({ name: 'Test_Data' });
      }));

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
      }, fail);

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(1000);
    }));

  });

  describe('with delaying', () => {

    it('should delay and then retry requests if one of requests fails when refresh should happen', fakeAsync(() => {
      const executed = [];

      spyOn(service, 'refreshToken').and.returnValue(ObservableDelay(TEST_TOKEN, 1000, () => {
        controller
          .expectOne(TEST_URI)
          .flush({name: 'Test_Data'});

        controller
          .expectOne(TEST_URI2)
          .flush({name: 'Test_Data2'});
      }));

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
        executed.push(TEST_URI);
      }, fail);

      http.get(TEST_URI2).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data2' });
        executed.push(TEST_URI2);
      }, fail);

      controller
        .expectOne(TEST_URI)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      controller
        .expectOne(TEST_URI2)
        .error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      controller.verify();

      expect(executed.length).toBe(2);
    }));

    fit('should delay requests if refresh is in progress', fakeAsync(() => {
      const executed = [];

      spyOn(service, 'refreshToken').and.returnValue(ObservableDelay(TEST_TOKEN, 1000, () => {
        controller
          .expectOne(TEST_URI)
          .flush({name: 'Test_Data'});

        controller
          .expectOne(TEST_URI2)
          .flush({name: 'Test_Data2'});
      }));

      http.get(TEST_URI).subscribe((data) => {
        expect(data).toEqual({ name: 'Test_Data' });
        expect(service.refreshToken).toHaveBeenCalled();
        executed.push(TEST_URI);
      }, fail);

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      http.get(TEST_URI2).subscribe(data => {
        expect(data).toEqual({ name: 'Test_Data2' });
        executed.push(TEST_URI2);
      }, fail);

      const req2 = controller.expectOne(TEST_URI2);

      expect(req2.request.url).toBe(TEST_URI2);
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req2.error(new ErrorEvent('401'), { status: 401 });

      tick(500);

      controller.verify();

      expect(executed.length).toBe(2);
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

  describe('with request', () => {
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
