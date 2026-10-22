import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { PlataformaService } from '../services/plataforma.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (!inject(AuthService).isAuthenticated())
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return inject(PlataformaService)
    .perfil()
    .pipe(
      map((p) => (p.gestor ? true : router.createUrlTree(['/perfil']))),
      catchError(() => of(router.createUrlTree(['/home']))),
    );
};
