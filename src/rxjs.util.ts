import { Observable } from 'rxjs/Observable';
import { first as _first } from 'rxjs/operator/first';
import { switchMap as _switchMap } from 'rxjs/operator/switchMap';
import { map as _map } from 'rxjs/operator/map';
import { _catch as __catch } from 'rxjs/operator/catch';

export function first<T>(obs: Observable<T>): Observable<T> {
  return _first.call(obs);
}

export function switchMap<T, R>(
  obs: Observable<T>,
  project: (value: T, index: number) => Observable<R>
): Observable<R> {
  return _switchMap.call(obs, project);
}

export function map<T, R>(
  obs: Observable<T>,
  project: (value: T, index: number) => R
): Observable<R> {
  return _map.call(obs, project);
}

export function _catch<T, R>(
  obs: Observable<T>,
  selector: (err: any, caught: Observable<T>) => Observable<R>
): Observable<T | R> {
  return __catch.call(obs, selector);
}

export { _throw } from 'rxjs/observable/throw';
