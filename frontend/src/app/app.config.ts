import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-DO';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

registerLocaleData(localeEs);

const theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}',
      400: '{blue.400}', 500: '{blue.600}', 600: '{blue.700}', 700: '{blue.800}',
      800: '{blue.900}', 900: '{blue.950}', 950: '{blue.950}'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-DO' },
    MessageService,
    providePrimeNG({
      theme: { preset: theme, options: { darkModeSelector: false } },
      translation: {
        emptyMessage: 'Sin resultados',
        emptyFilterMessage: 'Sin resultados',
        aria: {
          close: 'Cerrar',
          firstPageLabel: 'Primera página',
          lastPageLabel: 'Última página',
          nextPageLabel: 'Página siguiente',
          prevPageLabel: 'Página anterior',
          pageLabel: 'Página {page}'
        }
      }
    })
  ]
};
