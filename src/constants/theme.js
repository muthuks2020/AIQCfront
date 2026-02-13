export const colors = {

  brand: {
    primary: '#0066FF',
    secondary: '#6B7280',
    primaryDark: '#0052CC',
    primaryLight: '#3384FF',
    secondaryDark: '#4B5563',
    secondaryLight: '#9CA3AF',
  },


  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#3384FF',
  primaryBg: 'rgba(0, 102, 255, 0.08)',


  secondary: '#6B7280',
  secondaryDark: '#4B5563',
  secondaryLight: '#9CA3AF',


  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  successBg: 'rgba(16, 185, 129, 0.1)',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.1)',

  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerLight: '#F87171',
  dangerBg: 'rgba(239, 68, 68, 0.1)',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoLight: '#60A5FA',
  infoBg: 'rgba(59, 130, 246, 0.1)',


  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },


  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#111827',
  },


  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },


  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },


  roles: {
    admin: {
      primary: '#8B5CF6',
      light: 'rgba(139, 92, 246, 0.1)',
    },
    maker: {
      primary: '#0066FF',
      light: 'rgba(0, 102, 255, 0.1)',
    },
    checker: {
      primary: '#10B981',
      light: 'rgba(16, 185, 129, 0.1)',
    },
  },


  inspection: {
    passed: '#10B981',
    passedBg: 'rgba(16, 185, 129, 0.1)',
    failed: '#EF4444',
    failedBg: 'rgba(239, 68, 68, 0.1)',
    pending: '#F59E0B',
    pendingBg: 'rgba(245, 158, 11, 0.1)',
    inProgress: '#3B82F6',
    inProgressBg: 'rgba(59, 130, 246, 0.1)',
  },
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
  input: '0 1px 2px rgba(0, 0, 0, 0.05)',
  inputFocus: '0 0 0 3px rgba(0, 102, 255, 0.15)',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  default: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

export const transitions = {
  fast: '150ms ease',
  default: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};

export default {
  colors,
  shadows,
  borderRadius,
  spacing,
  typography,
  transitions,
  zIndex,
};
