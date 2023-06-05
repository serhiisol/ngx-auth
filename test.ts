import 'jest-preset-angular/setup-jest';

import 'zone.js/dist/zone';

function fail(reason: any) {
  throw new Error(reason);
}

(global as any).fail = fail;
