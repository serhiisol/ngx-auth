import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';
import { Request, Response, ResponseOptions, Headers } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import { MockHttpModule, Http, RequestInterceptorOptions, ResponseInterceptorOptions } from 'ng4-http';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';
import { AuthInterceptor } from './auth.interceptor';

const TEST_URI = 'TEST_URI';
const TEST_TOKEN = 'TEST_TOKEN';

class AuthenticationServiceStub {
  isAuthorized() {}
  getAccessToken() {}
  refreshToken() {}
  refreshShouldHappen() {}
  verifyTokenRequest() {}
}

function ObservableDelay<T>(val: T, delay: number): Observable<any> {
  return new Observable(observer => {
    setTimeout(() => {
      observer.next();
      observer.complete();
    }, delay);
  });
}

describe('AuthInterceptor', () => {
  let http: Http;
  let interceptor: AuthInterceptor;
  let service: AuthService;
  let request: Request;
  let response: Response;
  let backend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MockHttpModule ],
      providers: [
        AuthInterceptor,
        { provide: AUTH_SERVICE, useClass: AuthenticationServiceStub }
      ]
    });
  });

  beforeEach(inject(
    [AuthInterceptor, Http, AUTH_SERVICE, MockBackend],
    (_interceptor: AuthInterceptor, _http: Http, _service: AuthService, _backend: MockBackend) => {
      interceptor = _interceptor;
      http = _http;
      service = _service;
      backend = _backend;
    }
  ));

  beforeEach(() => {
    request = new Request({
      url: TEST_URI,
      headers: new Headers()
    });
    response = new Response(new ResponseOptions({
      url: TEST_URI,
      body: {},
      headers: new Headers()
    }));
  });

  it('should instantiate interceptor', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('with request', () => {

    it('should pass request normally', async(() => {
      interceptor
        .request({ url: request })
        .subscribe(({ url }: RequestInterceptorOptions) => {
          expect(url).toEqual(request);
        });
    }));

    it('should pass request normally with token', async(() => {
      spyOn(service, 'getAccessToken').and.returnValue( Observable.of(TEST_TOKEN) );

      interceptor
        .request({ url: request })
        .subscribe(({ url }: RequestInterceptorOptions) => {
          expect(url).toEqual(request);
          expect((<Request>url).headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);
        });
    }));

  });

  describe('with responseError', () => {

    it('should throw error', () => {
      spyOn(service, 'refreshShouldHappen').and.returnValue( false );
      spyOn(service, 'refreshToken').and.returnValue( Observable.of() );
      spyOn(http, 'request').and.returnValue( Observable.of(true) );

      interceptor
        .responseError({ url: request, response })
        .catch((opts: ResponseInterceptorOptions) => {
          expect(service.refreshShouldHappen).toHaveBeenCalledWith({});
          expect(service.refreshShouldHappen).toHaveBeenCalledWith({});
          expect(opts.url).toEqual(request);
          expect(opts.response).toEqual(response);
          expect(service.refreshToken).not.toHaveBeenCalled();
          expect(http.request).not.toHaveBeenCalledWith(request, undefined);
          return Observable.throw(opts);
        });
    });

    it('should trigger refresh token request after failed original request', () => {
      spyOn(service, 'refreshShouldHappen').and.returnValue( true );
      spyOn(service, 'refreshToken').and.returnValue( Observable.of() );
      spyOn(http, 'request').and.returnValue( Observable.of(true) );

      interceptor
        .responseError({ url: request, response })
        .subscribe((status) => {
          expect(status).toBeTruthy();

          expect(service.refreshShouldHappen).toHaveBeenCalledWith({});
          expect(service.refreshShouldHappen).toHaveBeenCalledWith({});
          expect(service.refreshToken).toHaveBeenCalled();
          expect(http.request).toHaveBeenCalledWith(request, undefined);
        });
    });

  });

  describe('with delaying', () => {

    let request2: Request;

    beforeEach(() => {
      request2 = new Request({
        url: TEST_URI + TEST_URI,
        headers: new Headers()
      });
    });

    it('should delay requests if refresh is in progress', fakeAsync(() => {
      let requestCount = 0;

      let refreshObservable = ObservableDelay(true, 1000);
      refreshObservable.subscribe(() => {
        requestCount += 1;
        expect(requestCount).toBe(1);
      });

      spyOn(service, 'refreshShouldHappen').and.returnValue(true);
      spyOn(service, 'refreshToken').and.returnValue(refreshObservable);
      spyOn(http, 'request').and.callThrough();

      backend.connections.subscribe((c: MockConnection) => {
        requestCount += 1;
        c.mockRespond(response);
      });

      interceptor
        .responseError({url: request, response})
        .subscribe(() => {
          expect(http.request).toHaveBeenCalledWith(request, undefined);
          expect(requestCount).toBe(2);
        });

      interceptor
        .request({url: request2})
        .subscribe(() => expect(requestCount).toBe(2));

      expect(requestCount).toBe(0);

      tick(500);
      expect(requestCount).toBe(0);

      tick(499);
      expect(requestCount).toBe(0);

      tick(1);
      expect(requestCount).toBe(2);
    }));

  });

});
