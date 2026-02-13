import React from 'react';
import { colors, borderRadius, shadows, transitions } from '../../constants/theme';

const variants = {
  primary: {
    background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
    color: 'white',
    border: 'none',
    boxShadow: shadows.primary,
  },
  secondary: {
    background: colors.neutral[100],
    color: colors.neutral[700],
    border: 'none',
  },
  success: {
    background: colors.success,
    color: 'white',
    border: 'none',
  },
  danger: {
    background: colors.danger,
    color: 'white',
    border: 'none',
  },
  warning: {
    background: colors.warning,
    color: 'white',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: colors.primary,
    border: `1.5px solid ${colors.primary}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral[600],
    border: 'none',
  },
  white: {
    background: 'white',
    color: colors.neutral[700],
    border: `1px solid ${colors.neutral[200]}`,
  },
};

const sizes = {
  xs: { padding: '6px 10px', fontSize: '12px', gap: '6px' },
  sm: { padding: '8px 14px', fontSize: '13px', gap: '6px' },
  md: { padding: '10px 20px', fontSize: '14px', gap: '8px' },
  lg: { padding: '12px 24px', fontSize: '15px', gap: '10px' },
  xl: { padding: '14px 28px', fontSize: '16px', gap: '10px' },
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  loading = false,
  onClick,
  style = {},
  type = 'button',
  ...props
}) => {
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeStyles.gap,
        borderRadius: borderRadius.md,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        transition: transitions.normal,
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        ...variantStyles,
        ...sizeStyles,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={16} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={sizeStyles.fontSize === '12px' ? 14 : 18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={sizeStyles.fontSize === '12px' ? 14 : 18} />}
        </>
      )}
    </button>
  );
};

const LoadingSpinner = ({ size = 16 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'currentColor',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}
  />
);

export default Button;
