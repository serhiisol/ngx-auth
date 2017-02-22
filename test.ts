import 'core-js/client/shim.js';
import 'reflect-metadata/Reflect';

import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

/**
 * Library related
 */
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/switchMap';

/**
 * Tests related
 */
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';


import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare var __karma__: any;
declare var require: any;


__karma__.loaded = () => {};

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const context = require.context('./', true, /\.spec\.ts$/);

context.keys().map(context);

__karma__.start();
