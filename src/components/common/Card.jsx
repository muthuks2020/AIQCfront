import React, { useState } from 'react';
import { colors, borderRadius, shadows, transitions } from '../../constants/theme';

export const Card = ({
  children,
  padding = '24px',
  hover = false,
  onClick,
  variant = 'default',
  style = {},
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    default: {
      background: 'white',
      border: `1px solid ${colors.neutral[100]}`,
    },
    elevated: {
      background: 'white',
      border: 'none',
      boxShadow: shadows.md,
    },
    outlined: {
      background: 'transparent',
      border: `1px solid ${colors.neutral[200]}`,
    },
    gradient: {
      background: `linear-gradient(135deg, ${colors.primaryLight} 0%, white 100%)`,
      border: `1px solid ${colors.neutral[100]}`,
    },
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={className}
      style={{
        borderRadius: borderRadius.xl,
        padding,
        boxShadow: isHovered ? shadows.cardHover : shadows.card,
        cursor: onClick ? 'pointer' : 'default',
        transition: transitions.normal,
        transform: isHovered && hover ? 'translateY(-2px)' : 'none',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};


export const StatCard = ({
  label,
  value,
  change,
  icon: Icon,
  color = colors.primary,
  trend = 'up',
}) => {
  const trendColor = trend === 'up' ? colors.success : colors.danger;

  return (
    <Card hover>
      <div style={styles.statCard}>
        <div style={{ ...styles.statIcon, background: `${color}10`, color }}>
          {Icon && <Icon size={22} />}
        </div>
        <div style={styles.statContent}>
          <span style={styles.statLabel}>{label}</span>
          <div style={styles.statValueRow}>
            <span style={styles.statValue}>{value}</span>
            {change && (
              <span style={{ ...styles.statChange, color: trendColor }}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const styles = {
  statCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: colors.neutral[500],
    fontWeight: 500,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.neutral[800],
  },
  statChange: {
    fontSize: '12px',
    fontWeight: 600,
  },
};

export default Card;
