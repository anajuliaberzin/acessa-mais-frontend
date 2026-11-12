import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MotionService } from './accessibility/motion.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(MotionService).initialize()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
  ]
};
