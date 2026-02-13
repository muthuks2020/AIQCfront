// Authentication Context
// Manages user authentication state, roles, and provides SSO integration hooks

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// User roles enum
export const USER_ROLES = {
  ADMIN: 'admin',
  MAKER: 'maker',
  CHECKER: 'checker',
};

// Role display names and descriptions
export const ROLE_INFO = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Full access to configuration masters and system settings',
    icon: 'Shield',
    color: '#7C3AED',
  },
  [USER_ROLES.MAKER]: {
    name: 'QC-Maker',
    description: 'Perform quality inspections and enter QC data',
    icon: 'ClipboardCheck',
    color: '#003366',
  },
  [USER_ROLES.CHECKER]: {
    name: 'QC-Checker',
    description: 'Review and validate QC entries made by makers',
    icon: 'CheckCircle',
    color: '#059669',
  },
};

// Dummy users for development/testing
const DUMMY_USERS = {
  admin: {
    id: 'usr_admin_001',
    username: 'admin',
    password: 'admin123',
    email: 'admin@appasamy.com',
    name: 'System Administrator',
    role: USER_ROLES.ADMIN,
    avatar: null,
    department: 'IT',
    employeeId: 'EMP001',
  },
  maker: {
    id: 'usr_maker_001',
    username: 'qcmaker',
    password: 'maker123',
    email: 'qcmaker@appasamy.com',
    name: 'Ravi Kumar',
    role: USER_ROLES.MAKER,
    avatar: null,
    department: 'Quality Control',
    employeeId: 'EMP042',
  },
  checker: {
    id: 'usr_checker_001',
    username: 'qcchecker',
    password: 'checker123',
    email: 'qcchecker@appasamy.com',
    name: 'Priya Sharma',
    role: USER_ROLES.CHECKER,
    avatar: null,
    department: 'Quality Assurance',
    employeeId: 'EMP023',
  },
};

// Auth context
const AuthContext = createContext(null);

// Auth provider configuration
const AUTH_CONFIG = {
  // Storage key for persisting auth state
  storageKey: 'appasamy_qc_auth',
  
  // Session timeout in milliseconds (8 hours)
  sessionTimeout: 8 * 60 * 60 * 1000,
  
  // SSO Configuration (for future Office 365 integration)
  sso: {
    enabled: false, // Set to true when SSO is ready
    provider: 'microsoft',
    tenantId: '', // Add your Azure AD tenant ID
    clientId: '', // Add your Azure AD client ID
    redirectUri: typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'http://localhost:3000/auth/callback',
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  },
};

/**
 * AuthProvider Component
 * Provides authentication state and methods to the entire application
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedAuth = localStorage.getItem(AUTH_CONFIG.storageKey);
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          
          // Check if session is still valid
          const now = Date.now();
          if (parsed.loginTime && (now - parsed.loginTime) < AUTH_CONFIG.sessionTimeout) {
            setUser(parsed.user);
          } else {
            // Session expired
            localStorage.removeItem(AUTH_CONFIG.storageKey);
          }
        }
      } catch (e) {
        console.error('Error checking session:', e);
        localStorage.removeItem(AUTH_CONFIG.storageKey);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    // Small delay to prevent flash
    const timer = setTimeout(checkExistingSession, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Login with username and password
   * In production, this would call your backend API
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Find matching dummy user
      const matchedUser = Object.values(DUMMY_USERS).find(
        u => u.username === username && u.password === password
      );

      if (matchedUser) {
        // Remove password from user object before storing
        const { password: _, ...safeUser } = matchedUser;
        
        // Save to state and localStorage
        setUser(safeUser);
        localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify({
          user: safeUser,
          loginTime: Date.now(),
        }));

        // Store API bearer token for backend authentication
        localStorage.setItem('authToken', 'staging-token-change-me-2026');

        setIsLoading(false);
        return { success: true, user: safeUser };
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (err) {
      const errorMsg = 'Login failed. Please try again.';
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Logout - Clear session and redirect
   */
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem(AUTH_CONFIG.storageKey);
    localStorage.removeItem('authToken');
  }, []);

  /**
   * Initiate SSO login with Microsoft
   */
  const loginWithSSO = useCallback(async () => {
    if (!AUTH_CONFIG.sso.enabled) {
      setError('SSO is not yet configured');
      return { success: false, error: 'SSO is not yet configured' };
    }

    try {
      const { tenantId, clientId, redirectUri, scopes } = AUTH_CONFIG.sso;
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `response_mode=query&` +
        `state=${Math.random().toString(36).substring(2)}`;
      
      window.location.href = authUrl;
      return { success: true };
    } catch (err) {
      setError('Failed to initiate SSO login');
      return { success: false, error: 'Failed to initiate SSO login' };
    }
  }, []);

  /**
   * Handle SSO callback
   */
  const handleSSOCallback = useCallback(async (code) => {
   
    
    return { success: false, error: 'SSO callback handling not implemented' };
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  /**
   * Get the home route for the current user's role
   */
  const getHomeRoute = useCallback(() => {
    if (!user) return '/login';
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return '/admin';
      case USER_ROLES.MAKER:
        return '/maker';
      case USER_ROLES.CHECKER:
        return '/checker';
      default:
        return '/login';
    }
  }, [user]);

  const value = {
    // State
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    authChecked,
    
    // Auth methods
    login,
    logout,
    loginWithSSO,
    handleSSOCallback,
    
    // Role helpers
    hasRole,
    hasAnyRole,
    getHomeRoute,
    
    // Config
    ssoEnabled: AUTH_CONFIG.sso.enabled,
    
    // Constants
    roles: USER_ROLES,
    roleInfo: ROLE_INFO,
    dummyUsers: DUMMY_USERS, // Expose for demo purposes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
