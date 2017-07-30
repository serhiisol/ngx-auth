import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpHandler
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { of } from 'rxjs/observable/of';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';
import { AuthInterceptor } from './auth.interceptor';

const TEST_URI = 'TEST_URI';
const TEST_URI2 = 'TEST_URI_2';
const TEST_REFRESH_URI = 'TEST_REFRESH_URI';
const TEST_TOKEN = 'TEST_TOKEN';

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
        expect(data['name']).toEqual('Test Data');
      }, () => {
        throw new Error('shouldn\'t be called')
      });

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.flush({name: 'Test Data'});

      controller.verify();
    });

  });

  describe('with responseError', () => {

    it('should throw error', () => {
      http.get(TEST_URI).subscribe(() => {
        throw new Error('shouldn\'t be called')
      }, e => {
        expect(e.status).toBe(400);
      });

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);

      req.error(new ErrorEvent('400'), { status: 400 });

      controller.verify();
    });

    fit('should trigger refresh token request after failed original request and retry original', () => {
      http.get(TEST_URI).subscribe((data) => {
        expect(data['name']).toEqual('Test Data');

        expect(service.verifyTokenRequest).toHaveBeenCalledWith(TEST_URI);
        expect(service.getAccessToken).toHaveBeenCalled();
        expect(service.refreshShouldHappen).toHaveBeenCalled();
        expect(service.refreshToken).toHaveBeenCalled();
      }, () => {
        throw new Error('shouldn\'t be called')
      });

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.error(new ErrorEvent('401'), { status: 401 });

      controller.verify();
    });

  });

  xdescribe('with delaying', () => {

    it('should delay requests if refresh is in progress', () => {
      // let requestCount = 0;
      //
      // let refreshObservable = ObservableDelay(1000);
      // refreshObservable.subscribe(() => {
      //   requestCount += 1;
      //   expect(requestCount).toBe(1);
      // });
      //
      // spyOn(service, 'refreshShouldHappen').and.returnValue(true);
      // spyOn(service, 'refreshToken').and.returnValue(refreshObservable);
      // spyOn(http, 'request').and.callThrough();
      //
      // backend.connections.subscribe((c: MockConnection) => {
      //   requestCount += 1;
      //   c.mockRespond(response);
      // });
      //
      // interceptor
      //   .responseError({url: request, response})
      //   .subscribe(() => {
      //     expect(http.request).toHaveBeenCalledWith(request, undefined);
      //     expect(requestCount).toBe(2);
      //   });
      //
      // interceptor
      //   .request({url: request2})
      //   .subscribe(() => expect(requestCount).toBe(2));
      //
      // expect(requestCount).toBe(0);
      //
      // tick(500);
      // expect(requestCount).toBe(0);
      //
      // tick(499);
      // expect(requestCount).toBe(0);
      //
      // tick(1);
      // expect(requestCount).toBe(2);



      spyOn(service, 'verifyTokenRequest').and.callFake((url: string) => {
        return url === TEST_REFRESH_URI;
      });
      spyOn(service, 'refreshShouldHappen').and.returnValue(true);
      // spyOn(service, 'refreshToken').and.returnValue( delay.call(of(TEST_TOKEN), 1000) );

      http.get(TEST_URI).subscribe((data) => {
        expect(data['name']).toEqual('Test Data');

        expect(service.verifyTokenRequest).toHaveBeenCalledWith(TEST_URI);
        expect(service.getAccessToken).toHaveBeenCalled();
        expect(service.refreshShouldHappen).toHaveBeenCalled();
        expect(service.refreshToken).toHaveBeenCalled();
      }, () => {
        throw new Error('shouldn\'t be called')
      });

      http.get(TEST_URI2).subscribe((data) => {
        expect(data['name']).toBe('test2');
      });

      const req = controller.expectOne(TEST_URI);
      const req2 = controller.expectOne(TEST_URI2);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.error(new ErrorEvent('401'));
      req2.flush({ name: 'test2' });

      controller.verify();

    });

  });

});
