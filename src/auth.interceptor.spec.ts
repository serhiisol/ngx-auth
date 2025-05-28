import { HttpClient, type HttpErrorResponse, type HttpRequest, provideHttpClient } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ngxAuthInterceptor } from './auth.interceptor';
import { AUTH_SERVICE, type NgxAuthService } from './auth.service';

const TEST_URI = 'TEST_URI';
const TEST_URI2 = 'TEST_URI_2';
const TEST_SKIP_URI = 'TEST_SKIP_URI';
const TEST_REFRESH_URI = 'TEST_REFRESH_URI';
const TEST_TOKEN = 'TEST_TOKEN';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function authServiceFactory(http: HttpClient) {
  return {
    getAccessToken: jest.fn(() => Promise.resolve(TEST_TOKEN)),
    isAuthenticated: jest.fn(() => true),
    refreshShouldHappen: jest.fn((e: HttpErrorResponse) => e.status === 401),
    refreshToken: jest.fn(() => http.get(TEST_REFRESH_URI)),
    skipRequest: jest.fn((req: HttpRequest<any>) => req.url === TEST_SKIP_URI || req.url === TEST_REFRESH_URI),
  };
}

describe('NgxAuthInterceptor', () => {
  let http: HttpClient;
  let service: NgxAuthService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([ngxAuthInterceptor]),
        ),
        provideHttpClientTesting(),
        {
          deps: [HttpClient],
          provide: AUTH_SERVICE,
          useFactory: authServiceFactory,
        } as Provider,
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject<NgxAuthService>(AUTH_SERVICE);
  });

  afterEach(() => {
    jest.resetAllMocks();
    controller.verify();
  });

  describe('with request', () => {
    it('should pass request normally', async () => {
      const request$ = firstValueFrom(http.get(TEST_URI));

      await wait();

      const req = controller.expectOne(TEST_URI);

      expect(req.request.url).toBe(TEST_URI);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TEST_TOKEN}`);

      req.flush({ name: 'Test_Data' });

      expect(await request$).toEqual({ name: 'Test_Data' });
    });

    it('should skip process for some cases', async () => {
      const request$ = firstValueFrom(http.get(TEST_SKIP_URI));

      await wait();

      const req = controller.expectOne(TEST_SKIP_URI);

      expect(req.request.url).toBe(TEST_SKIP_URI);
      expect(req.request.headers.get('Authorization')).not.toBe(`Bearer ${TEST_TOKEN}`);

      req.flush({ name: 'Test_Data' });

      expect(await request$).toEqual({ name: 'Test_Data' });
    });
  });

  describe('with responseError', () => {
    it('should throw error', async () => {
      const request$ = firstValueFrom(http.get(TEST_URI));

      await wait();

      controller.expectOne(TEST_URI)
        .error(new ProgressEvent('400'), { status: 400 });

      try {
        expect(await request$);
        throw new Error('Request should have failed');
      } catch (e) {
        expect(e.status).toBe(400);
      }
    });

    it('should trigger refresh request after failed original request and retry original', async () => {
      const request$ = firstValueFrom(http.get(TEST_URI));

      await wait();

      controller.expectOne(TEST_URI)
        .error(new ProgressEvent('401'), { status: 401 });

      controller.expectOne(TEST_REFRESH_URI).flush({});

      await wait();

      controller.expectOne(TEST_URI)
        .flush({ name: 'Test_Data' });

      expect(await request$).toEqual({ name: 'Test_Data' });

      expect(service.refreshShouldHappen).toHaveBeenCalled();
      expect(service.refreshToken).toHaveBeenCalled();
    });
  });

  describe('with delaying', () => {
    it('should delay and then retry requests if one of requests fails when refreshShouldHappen', async () => {
      const request1$ = firstValueFrom(http.get(TEST_URI));
      const request2$ = firstValueFrom(http.get(TEST_URI2));

      await wait();

      controller.expectOne(TEST_URI)
        .error(new ProgressEvent('401'), { status: 401 });

      controller.expectOne(TEST_URI2)
        .error(new ProgressEvent('401'), { status: 401 });

      controller.expectOne(TEST_REFRESH_URI).flush({});

      await wait();

      controller.expectOne(TEST_URI)
        .flush({ name: 'Test_Data' });

      controller.expectOne(TEST_URI2)
        .flush({ name: 'Test_Data2' });

      expect(await request1$).toEqual({ name: 'Test_Data' });
      expect(await request2$).toEqual({ name: 'Test_Data2' });

      expect(service.refreshShouldHappen).toHaveBeenCalled();
      expect(service.refreshToken).toHaveBeenCalled();
    });

    it('should delay upcoming requests if refresh is in progress', async () => {
      const request1$ = firstValueFrom(http.get(TEST_URI));

      await wait();

      controller.expectOne(TEST_URI)
        .error(new ProgressEvent('401'), { status: 401 });

      const request2$ = firstValueFrom(http.get(TEST_URI2));

      await wait();

      // At this point second request is delayed and won't be registered in http

      controller.expectNone(TEST_URI2);

      controller.expectOne(TEST_REFRESH_URI).flush({});

      await wait();

      controller.expectOne(TEST_URI)
        .flush({ name: 'Test_Data' });

      controller.expectOne(TEST_URI2)
        .flush({ name: 'Test_Data2' });

      expect(await request1$).toEqual({ name: 'Test_Data' });
      expect(await request2$).toEqual({ name: 'Test_Data2' });

      expect(service.refreshShouldHappen).toHaveBeenCalled();
      expect(service.refreshToken).toHaveBeenCalled();
    });
  });
});
