import { InjectionToken } from '@angular/core';

import { AuthService } from './auth.service';

export const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');
export const PUBLIC_FALLBACK_PAGE_URI = new InjectionToken('PUBLIC_FALLBACK_PAGE_URI');
export const PROTECTED_FALLBACK_PAGE_URI = new InjectionToken('PROTECTED_FALLBACK_PAGE_URI');
