import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Palette professionnelle pour Immotran : indigo profond (confiance,
 * finance) comme couleur primaire, gris ardoise neutre pour les
 * surfaces. Les couleurs semantiques (success/danger/warn) restent
 * celles d'Aura, deja coherentes avec ce type de palette.
 */
export const ImmotranPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});

/** Palette fixe utilisee par les graphiques (hors jetons PrimeNG, directement en hex pour Chart.js). */
export const CHART_COLORS = {
  occupied: '#4f46e5',
  vacant: '#f59e0b',
  revenue: '#10b981',
  expenses: '#f43f5e',
  maintenance: '#f97316',
  neutral: '#94a3b8',
};
