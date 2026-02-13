import React from 'react';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export const Header = ({
  title,
  subtitle,
  actions,
  showSearch = false,
  showNotifications = true,
}) => {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      <div style={styles.rightSection}>
        {showSearch && (
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              style={styles.searchInput}
            />
          </div>
        )}

        {actions && <div style={styles.actions}>{actions}</div>}

        <div style={styles.utilities}>
          <button style={styles.utilityButton} title="Help">
            <HelpCircle size={20} />
          </button>
          {showNotifications && (
            <button style={styles.utilityButton} title="Notifications">
              <Bell size={20} />
              <span style={styles.notificationDot} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    background: 'white',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },

  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.neutral[800],
    margin: 0,
  },

  subtitle: {
    fontSize: '14px',
    color: colors.neutral[500],
    margin: 0,
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.neutral[200]}`,
    minWidth: '240px',
  },

  searchIcon: {
    color: colors.neutral[400],
  },

  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: colors.neutral[700],
    width: '100%',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  utilities: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: '8px',
    paddingLeft: '16px',
    borderLeft: `1px solid ${colors.neutral[200]}`,
  },

  utilityButton: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.lg,
    border: 'none',
    background: 'transparent',
    color: colors.neutral[500],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  notificationDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: colors.danger,
    border: '2px solid white',
  },
};

export default Header;
