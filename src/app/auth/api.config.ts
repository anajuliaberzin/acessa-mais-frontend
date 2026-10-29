import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const hostname = inject(DOCUMENT).location?.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
      ? 'http://127.0.0.1:8000/api'
      : 'https://acessa-mais-backend.onrender.com/api';
  },
});
