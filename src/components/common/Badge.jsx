import React from 'react';
import { colors, borderRadius } from '../../constants/theme';

const statusStyles = {
  pending: {
    background: colors.warningLight,
    color: colors.warning,
  },
  in_progress: {
    background: colors.primaryLight,
    color: colors.primary,
  },
  completed: {
    background: colors.successLight,
    color: colors.success,
  },
  rejected: {
    background: colors.dangerLight,
    color: colors.danger,
  },
  approved: {
    background: colors.successLight,
    color: colors.success,
  },
  draft: {
    background: colors.neutral[100],
    color: colors.neutral[600],
  },
};

const priorityStyles = {
  high: {
    background: colors.dangerLight,
    color: colors.danger,
  },
  medium: {
    background: colors.warningLight,
    color: colors.warning,
  },
  low: {
    background: colors.neutral[100],
    color: colors.neutral[600],
  },
  critical: {
    background: colors.danger,
    color: 'white',
  },
};

const sizeStyles = {
  xs: { padding: '2px 6px', fontSize: '10px' },
  sm: { padding: '2px 8px', fontSize: '11px' },
  md: { padding: '4px 12px', fontSize: '12px' },
  lg: { padding: '6px 14px', fontSize: '13px' },
};

export const Badge = ({
  children,
  type = 'status',
  value,
  size = 'md',
  dot = false,
  style = {},
}) => {
  const styleMap = type === 'priority' ? priorityStyles : statusStyles;
  const badgeStyle = styleMap[value] || styleMap.pending;

  const formatLabel = (val) => {
    return val?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || children;
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: borderRadius.full,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        ...badgeStyle,
        ...sizeStyles[size],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'currentColor',
          }}
        />
      )}
      {formatLabel(value)}
    </span>
  );
};

export default Badge;
