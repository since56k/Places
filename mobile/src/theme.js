// Places design system: Tuscan Minimal
// All mobile screens should consume these tokens instead of hard-coded UI values.

export const colors = {
  background: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceSoft: '#FBFAF7',
  text: '#171717',
  textSecondary: '#737373',
  muted: '#737373',
  border: '#E7E4DE',
  accent: '#C65D3B',
  accentDark: '#A94B2D',
  accentSoft: '#F2E4DE',
  success: '#54735A',
  error: '#B64545',
  overlay: 'rgba(23, 23, 23, 0.42)',
};

export const typography = {
  fontFamily: {
    display: 'DMSerifDisplay_400Regular',
    body: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    display: 42,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 36,
    display: 48,
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#171717',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
};
