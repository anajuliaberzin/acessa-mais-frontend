import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

export const REQUIRE_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const baseUrl = inject(API_BASE_URL);
  const auth = inject(AuthService);
  if (!request.url.startsWith(baseUrl + '/') || !request.context.get(REQUIRE_AUTH)) {
    return next(request);
  }
  const token = auth.accessToken();
  if (!token) {
    auth.expireSession();
    return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Authentication required' }));
  }
  const authenticated = (access: string) =>
    request.clone({ setHeaders: { Authorization: 'Bearer ' + access } });
  return next(authenticated(token)).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      if (!auth.isAuthenticated()) return throwError(() => error);
      const current = auth.accessToken();
      return (current !== token ? of(current!) : auth.refresh()).pipe(
        catchError((refreshError) => {
          if (auth.accessToken() === token) auth.expireSession();
          return throwError(() => refreshError);
        }),
        switchMap((access) => next(authenticated(access)).pipe(
          catchError((retryError) => {
            if (retryError instanceof HttpErrorResponse && retryError.status === 401 &&
                auth.accessToken() === access) auth.expireSession();
            return throwError(() => retryError);
          }),
        )),
      );
    }),
  );
};
