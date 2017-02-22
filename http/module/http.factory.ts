import { Http } from '../service';

export function httpFactory(backend, options, interceptorStore) {
  return new Http(backend, options, interceptorStore);
}
