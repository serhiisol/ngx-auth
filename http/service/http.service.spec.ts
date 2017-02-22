import { TestBed, inject, async } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Response, ResponseOptions, RequestMethod } from '@angular/http';

import { MockHttpModule } from '../module';
import { Http } from './http.service';

const TestUri = 'http://test.uri';
const Body = { foo: 'bar' };

function getBody(c: MockConnection): Object {
  return JSON.parse(c.request.getBody());
}

describe('Http', () => {
  let http: Http;
  let backend: MockBackend;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ MockHttpModule ]
  }));

  beforeEach(inject([Http, MockBackend], (_service: Http, _backend: MockBackend) => {
    http = _service;
    backend = _backend;
  }));

  it('should instantiate service', () => {
    expect(http).toBeTruthy();
  });

  it('should send get request', async(() => {
    const mockResponse = new Response(new ResponseOptions({ body: Body }));

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Get);
      c.mockRespond(mockResponse);
    });

    http.get(TestUri)
      .map(data => data.json())
      .subscribe(data => expect(data).toEqual(Body));
  }));

  it('should send post request', async(() => {
    const mockResponse = new Response(new ResponseOptions({ body: Body }));

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Post);
      expect(getBody(c)).toEqual(Body);
      c.mockRespond(mockResponse);
    });

    http.post(TestUri, Body)
      .map(data => data.json())
      .subscribe(data => expect(data).toEqual(Body));
  }));

  it('should send put request', async(() => {
    const mockResponse = new Response(new ResponseOptions({ body: Body }));

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Put);
      expect(getBody(c)).toEqual(Body);
      c.mockRespond(mockResponse);
    });

    http.put(TestUri, Body)
      .map(data => data.json())
      .subscribe(data => expect(data).toEqual(Body));
  }));

  it('should send delete request', async(() => {
    let mockResponse = new Response(new ResponseOptions({ body: Body }));

    backend.connections.subscribe((c: MockConnection) => {
      expect(c.request.url).toBe(TestUri);
      expect(c.request.method).toBe(RequestMethod.Delete);
      c.mockRespond(mockResponse);
    });

    http.delete(TestUri)
      .map(data => data.json())
      .subscribe(data => expect(data).toEqual(Body));

  }));

});
