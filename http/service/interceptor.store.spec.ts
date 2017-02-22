import { TestBed, inject, async } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Response, ResponseOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { MockHttpModule } from '../module';
import { Http } from './http.service';
import { Interceptor, ResponseInterceptorOptions } from '../interfaces';
import { InterceptorStore } from './interceptor.store';

const TestUri = 'http://test.uri';
const Body = { foo: 'bar' };

describe('Http Interceptors Store', () => {
  let http: Http;
  let backend: MockBackend;
  let interceptorStore: InterceptorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MockHttpModule ],
      providers: [ InterceptorStore ]
    });
  });

  beforeEach(inject(
    [ Http, MockBackend, InterceptorStore ],
    (_service: Http, _backend: MockBackend, _interceptorStore: InterceptorStore) => {
      http = _service;
      backend = _backend;
      interceptorStore = _interceptorStore;
    }
  ));

  it('should instantiate service', () => {
    expect(http).toBeTruthy();
  });

  it('should return successful response, if interceptor store is empty', () => {
    const mockResponse = new Response(new ResponseOptions({ body: Body }));

    expect(interceptorStore.interceptors.length).toEqual(0);

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Get);
      c.mockRespond(mockResponse);
    });

    http
      .request(TestUri)
      .subscribe((response: Response) => {
        expect(response.json()).toEqual(Body);
      }, () => {
        throw new Error('should not be called');
      });
  });

  it('should return unsuccessful response, if interceptor store is empty', () => {
    const error = JSON.stringify(Body);

    expect(interceptorStore.interceptors.length).toEqual(0);

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Get);
      c.mockError(new Error(error));
    });

    http
      .request(TestUri)
      .subscribe(() => {
        throw new Error('should not be called');
      }, err => {
        expect(err.message).toEqual(error);
        return Observable.throw(null);
      });
  });

  describe('request interceptor', () => {

    it('should send a request, if only one empty interceptor was registered', async(() => {
      const interceptor: Interceptor = {};

      interceptorStore.interceptors = [interceptor];

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);
        c.mockRespond(mockResponse);
      });

      http
        .request(TestUri)
        .subscribe((response: Response) => {
          expect(response.json()).toEqual(Body);
        });
    }));

    it('should modify options before original request', async(() => {
      const interceptor: Interceptor = {};

      interceptor.request = ({ url, options }) => {
        options = { ...options, withCredentials: true};
        return Observable.of({ url, options });
      };

      interceptorStore.interceptors = [ interceptor ];

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);
        expect(c.request.withCredentials).toBeTruthy();
        c.mockRespond(mockResponse);
      });

      http
        .request(TestUri)
        .subscribe(response => {
          expect(response.json()).toEqual(Body);
        });

    }));

    it('should cancel(reject) request, if interceptor throws an error', async(() => {
      let interceptor: Interceptor = {};
      interceptor.request = () => Observable.throw(Body);
      interceptor.requestError = arg => Observable.of(arg);

      spyOn(interceptor, 'request').and.callThrough();
      spyOn(interceptor, 'requestError').and.callThrough();

      interceptorStore.interceptors = [ interceptor ];

      backend.connections.subscribe(() => {
        throw new Error('should not be called');
      });

      http
        .request(TestUri)
        .subscribe(() => {
          throw new Error('should not be called');
        }, error => {
          expect(error).toEqual(Body);
          expect(interceptor.requestError).not.toHaveBeenCalled();
          expect(interceptor.request).toHaveBeenCalled();
          return Observable.throw(null);
        });
    }));

    it('should restore request, if the last interceptor returns not rejected Observable', async(() => {
      let interceptorError: Interceptor = {};
      interceptorError.request = ops => Observable.throw(ops);

      let interceptorRecover: Interceptor = {};
      interceptorRecover.requestError = ops => Observable.of(ops);

      interceptorStore.interceptors = [ interceptorError, interceptorRecover ];

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);
        c.mockRespond(mockResponse);
      });

      http
        .get(TestUri)
        .subscribe(response => {
          expect(response.json()).toEqual(Body);
        });
    }));
  });

  describe('response interceptor', () => {

    it('should call interceptor response, if request was successful', async(() => {
      let interceptor: Interceptor = {};
      interceptor.response = resp => Observable.of(resp);
      spyOn(interceptor, 'response').and.callThrough();

      interceptorStore.interceptors = [ interceptor ];

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);
        c.mockRespond(mockResponse);
      });

      http
        .request(TestUri)
        .subscribe(response => {
          expect(interceptor.response).toHaveBeenCalled();
          expect(response.json()).toEqual(Body);
        });

    }));

    it('should restore response interceptor', async(() => {
      let interceptor: Interceptor = {};
      interceptor.responseError = (resp: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> => {
        return Observable.of(resp);
      };

      interceptorStore.interceptors = [interceptor];

      spyOn(interceptor, 'responseError').and.callThrough();

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);
        c.mockError(<any>mockResponse);
      });

      http
        .request(TestUri)
        .subscribe(response => {
          expect(interceptor.responseError).toHaveBeenCalled();
          expect(response.json()).toEqual(Body);
        });

    }));

    it('should throw an error, if response interceptor throws an error', async(() => {
      let interceptor: Interceptor = {};
      interceptor.response = arg => Observable.throw(Body);

      interceptorStore.interceptors = [interceptor];
      spyOn(interceptor, 'response').and.callThrough();

      let mockResponse = new Response(new ResponseOptions({ body: Body }));

      backend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toBe(TestUri);
        expect(c.request.method).toBe(RequestMethod.Get);

        c.mockRespond(mockResponse);
      });

      http
        .request(TestUri)
        .subscribe(() => {
          throw new Error('should not be called');
        }, error => {
          expect(error).toEqual(Body);
          return Observable.throw(null);
        });
    }));

  });

});
