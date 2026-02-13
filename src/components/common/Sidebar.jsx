import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Shield,
  CheckCircle2,
  ListChecks,
  History,
  Boxes,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { useAuth, USER_ROLES, ROLE_INFO } from '../../contexts/AuthContext';
import { colors, shadows, borderRadius, transitions } from '../../constants/theme';


const APPASAMY_LOGO_URL = 'https://cdn.prod.website-files.com/637e4dc883878debd9d96de4/63df53786bf1b137a5731bb2_AA%20Logo(1).png';


const NAV_CONFIG = {
  [USER_ROLES.ADMIN]: {
    title: 'Admin Panel',
    items: [
      { id: 'dashboard', path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'sampling-master', path: '/admin/sampling-master', icon: Boxes, label: 'Sampling Master' },
      { id: 'component-master', path: '/admin/component-master', icon: Package, label: 'Component Master' },
      { id: 'users', path: '/admin/users', icon: Users, label: 'User Management' },
      { id: 'reports', path: '/admin/reports', icon: BarChart3, label: 'Reports' },
      { id: 'settings', path: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
  [USER_ROLES.MAKER]: {
    title: 'QC Workstation',
    items: [
      { id: 'dashboard', path: '/maker', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'inspection', path: '/maker/inspection', icon: ClipboardCheck, label: 'Inspection' },
      { id: 'batches', path: '/maker/batches', icon: Package, label: 'Batches' },
      { id: 'history', path: '/maker/history', icon: History, label: 'My History' },
      { id: 'reports', path: '/maker/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  [USER_ROLES.CHECKER]: {
    title: 'QC Validation',
    items: [
      { id: 'dashboard', path: '/checker', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'pending', path: '/checker/pending', icon: ListChecks, label: 'Pending Review' },
      { id: 'validated', path: '/checker/validated', icon: CheckCircle2, label: 'Validated' },
      { id: 'rejected', path: '/checker/rejected', icon: AlertTriangle, label: 'Rejected' },
      { id: 'reports', path: '/checker/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
};


const Sidebar = ({ collapsed, onToggleCollapse, onLogout: externalLogout }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const role = user?.role || USER_ROLES.MAKER;
  const navConfig = NAV_CONFIG[role] || NAV_CONFIG[USER_ROLES.MAKER];
  const roleInfo = ROLE_INFO[role];

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (externalLogout) {
      externalLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    if (path === `/${role}` && location.pathname === `/${role}`) return true;
    return path !== `/${role}` && location.pathname.startsWith(path);
  };

  const showExpanded = !collapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.sidebar,
        width: showExpanded ? '260px' : '72px',
        borderColor: roleInfo?.color || colors.primary,
      }}
    >
      {}
      <button
        onClick={onToggleCollapse}
        style={styles.toggleButton}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {}
      <div style={styles.logoSection}>
        <div style={styles.logoContainer}>
          {showExpanded ? (
            <img
              src={APPASAMY_LOGO_URL}
              alt="Appasamy"
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div style={{
              ...styles.logoIcon,
              background: roleInfo?.color || colors.primary,
            }}>
              <span style={styles.logoLetter}>A</span>
            </div>
          )}
          <div style={{ ...styles.logoFallback, display: 'none' }}>
            <Building2 size={24} color={colors.primary} />
          </div>
        </div>
        {showExpanded && (
          <div style={styles.roleTag}>
            <span style={{
              ...styles.roleBadge,
              background: `${roleInfo?.color}15`,
              color: roleInfo?.color,
            }}>
              {roleInfo?.name || 'User'}
            </span>
          </div>
        )}
      </div>

      {}
      <nav style={styles.nav}>
        {showExpanded && (
          <div style={styles.navTitle}>{navConfig.title}</div>
        )}
        <ul style={styles.navList}>
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    ...styles.navItem,
                    background: active
                      ? `${roleInfo?.color || colors.primary}10`
                      : 'transparent',
                    color: active
                      ? roleInfo?.color || colors.primary
                      : colors.neutral[500],
                    justifyContent: showExpanded ? 'flex-start' : 'center',
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      flexShrink: 0,
                      color: active ? roleInfo?.color || colors.primary : colors.neutral[400],
                    }}
                  />
                  {showExpanded && (
                    <span style={styles.navLabel}>{item.label}</span>
                  )}
                  {active && (
                    <div style={{
                      ...styles.activeIndicator,
                      background: roleInfo?.color || colors.primary,
                    }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {}
      <div style={styles.userSection}>
        {showExpanded ? (
          <div style={styles.userInfo}>
            <div style={{
              ...styles.userAvatar,
              background: roleInfo?.color || colors.primary,
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.name || 'User'}</span>
              <span style={styles.userRole}>{user?.department || 'Department'}</span>
            </div>
          </div>
        ) : (
          <div style={{
            ...styles.userAvatarSmall,
            background: roleInfo?.color || colors.primary,
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          title="Sign out"
        >
          <LogOut size={18} />
          {showExpanded && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};


const styles = {
  sidebar: {
    height: '100vh',
    background: 'white',
    borderRight: `1px solid ${colors.neutral[100]}`,
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: `width ${transitions.normal}`,
    zIndex: 100,
    boxShadow: shadows.sm,
    overflow: 'hidden',
  },

  toggleButton: {
    position: 'absolute',
    right: '-12px',
    top: '24px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'white',
    border: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.neutral[500],
    transition: transitions.fast,
    zIndex: 10,
    boxShadow: shadows.sm,
  },

  logoSection: {
    padding: '20px 16px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    height: '36px',
    width: 'auto',
    maxWidth: '180px',
    objectFit: 'contain',
  },

  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoLetter: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 700,
  },

  logoFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleTag: {
    width: '100%',
    textAlign: 'center',
  },

  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: borderRadius.full,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  nav: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },

  navTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '0 12px 12px',
  },

  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px',
    borderRadius: borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: transitions.fast,
    position: 'relative',
    textAlign: 'left',
  },

  navLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '20px',
    borderRadius: '0 3px 3px 0',
  },

  userSection: {
    padding: '16px',
    borderTop: `1px solid ${colors.neutral[100]}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },

  userAvatarSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 auto',
  },

  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: colors.neutral[800],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  userRole: {
    fontSize: '11px',
    color: colors.neutral[500],
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.neutral[200]}`,
    background: 'transparent',
    color: colors.neutral[600],
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: transitions.fast,
  },
};

export default Sidebar;
