import type { Config } from 'jest';

export default {
  displayName: 'ngx-auth',
  passWithNoTests: true,
  setupFilesAfterEnv: [
    '<rootDir>/test-setup.ts',
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  testEnvironment: 'jsdom',
  testRegex: '\\.(test|spec)\\.(ts|js)x?$',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        stringifyContentPathRegex: '\\.(html|svg)$',
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)',
  ],
} as Config;
