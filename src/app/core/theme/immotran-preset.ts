import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Palette alignee sur la maquette de reference (12 ecrans) : bleu
 * "blue-600" comme couleur primaire (boutons, liens, etapes actives),
 * gris ardoise neutre pour les surfaces. Les couleurs semantiques
 * (success/danger/warn) restent celles d'Aura, deja coherentes.
 */
export const ImmotranPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
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
