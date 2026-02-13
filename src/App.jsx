import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, USER_ROLES } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute, MakerRoute, CheckerRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/common';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';


import SamplingMasterPage from './pages/admin/sampling-master/SamplingMasterPage';
import SamplingPlanMasterPage from './pages/admin/sampling-master/SamplingPlanMasterPage';
import QualityPlanConfigPage from './pages/admin/sampling-master/QualityPlanConfigPage';


import ComponentMasterPage from './pages/admin/ComponentMasterPage';
import ComponentMasterEntryPage from './pages/admin/component-master/ComponentMasterEntryPage';


import MakerDashboard from './pages/maker/MakerDashboard';
import InspectionExecutionPage from './pages/maker/inspection/InspectionExecutionPage';


import CheckerDashboard from './pages/checker/CheckerDashboard';
import CheckerValidationCenter from './pages/checker/CheckerValidationCenter';

import { colors } from './constants/theme';


const AppRoutes = () => {
  const { isAuthenticated, isLoading, authChecked, user, getHomeRoute, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleLoginSuccess = (user) => {
    const from = location.state?.from?.pathname;
    const homeRoute = getHomeRoute();
    navigate(from || homeRoute, { replace: true });
  };


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };


  if (isLoading || !authChecked) {
    return <GlobalLoadingScreen />;
  }


  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/auth/callback') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Routes>
      {}
      <Route
        path="/login"
        element={
          isAuthenticated ?
            <Navigate to={getHomeRoute()} replace /> :
            <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />

      {}
      <Route path="/auth/callback" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

      {}

      {}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <AdminDashboard />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Sampling Master - List */}
      <Route
        path="/admin/sampling-master"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <SamplingMasterPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Sampling Plan Master - Create New */}
      <Route
        path="/admin/sampling-master/sampling-plan/new"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <SamplingPlanMasterPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Sampling Plan Master - Edit */}
      <Route
        path="/admin/sampling-master/sampling-plan/edit/:id"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <SamplingPlanMasterPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Quality Plan Configuration - Create New */}
      <Route
        path="/admin/sampling-master/quality-plan/new"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <QualityPlanConfigPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Quality Plan Configuration - Edit */}
      <Route
        path="/admin/sampling-master/quality-plan/edit/:id"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <QualityPlanConfigPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Component Master - List */}
      <Route
        path="/admin/component-master"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <ComponentMasterPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Component Master - New Entry */}
      <Route
        path="/admin/component-master/new"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <ComponentMasterEntryPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Component Master - Edit Entry */}
      <Route
        path="/admin/component-master/edit/:id"
        element={
          <AdminRoute>
            <MainLayout role="admin" onLogout={handleLogout}>
              <ComponentMasterEntryPage />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* ==================== MAKER ROUTES ==================== */}

      {/* Maker Dashboard */}
      <Route
        path="/maker"
        element={
          <MakerRoute>
            <MainLayout role="maker" onLogout={handleLogout}>
              <MakerDashboard />
            </MainLayout>
          </MakerRoute>
        }
      />

      {/* Inspection Execution */}
      <Route
        path="/maker/inspection/:inspectionId"
        element={
          <MakerRoute>
            <MainLayout role="maker" onLogout={handleLogout}>
              <InspectionExecutionPage />
            </MainLayout>
          </MakerRoute>
        }
      />

      {/* ==================== CHECKER ROUTES ==================== */}

      {/* Checker Dashboard */}
      <Route
        path="/checker"
        element={
          <CheckerRoute>
            <MainLayout role="checker" onLogout={handleLogout}>
              <CheckerDashboard />
            </MainLayout>
          </CheckerRoute>
        }
      />

      {/* Checker Validation Center - Pending Reviews */}
      <Route
        path="/checker/pending"
        element={
          <CheckerRoute>
            <MainLayout role="checker" onLogout={handleLogout}>
              <CheckerValidationCenter />
            </MainLayout>
          </CheckerRoute>
        }
      />

      {/* Checker Validation Center - Review Detail */}
      <Route
        path="/checker/review/:id"
        element={
          <CheckerRoute>
            <MainLayout role="checker" onLogout={handleLogout}>
              <CheckerValidationCenter />
            </MainLayout>
          </CheckerRoute>
        }
      />

      {/* Checker Validation Center - Validated/Approved */}
      <Route
        path="/checker/validated"
        element={
          <CheckerRoute>
            <MainLayout role="checker" onLogout={handleLogout}>
              <CheckerValidationCenter />
            </MainLayout>
          </CheckerRoute>
        }
      />

      {/* Checker Validation Center - Rejected */}
      <Route
        path="/checker/rejected"
        element={
          <CheckerRoute>
            <MainLayout role="checker" onLogout={handleLogout}>
              <CheckerValidationCenter />
            </MainLayout>
          </CheckerRoute>
        }
      />

      {/* ==================== FALLBACK ROUTES ==================== */}

      {/* Root redirect based on role */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getHomeRoute()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

/**
 * Global Loading Screen Component
 * Displayed while checking authentication status
 */
const GlobalLoadingScreen = () => (
  <div style={styles.loadingContainer}>
    <div style={styles.loadingContent}>
      <div style={styles.loadingSpinner}></div>
      <h2 style={styles.loadingTitle}>Appasamy QC</h2>
      <p style={styles.loadingText}>Loading...</p>
    </div>
  </div>
);

/**
 * 404 Not Found Page Component
 */
const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getHomeRoute } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate(getHomeRoute());
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={styles.notFoundContainer}>
      <div style={styles.notFoundContent}>
        <div style={styles.notFound404}>404</div>
        <h1 style={styles.notFoundTitle}>Page Not Found</h1>
        <p style={styles.notFoundText}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button style={styles.notFoundButton} onClick={handleGoHome}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

/**
 * Main App Component
 * Wraps everything with BrowserRouter and AuthProvider
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Styles
const styles = {
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
  },
  loadingContent: {
    textAlign: 'center',
    color: 'white',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  loadingTitle: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  loadingText: {
    fontSize: '14px',
    opacity: 0.9,
  },
  notFoundContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: colors.neutral[50],
  },
  notFoundContent: {
    textAlign: 'center',
    padding: '40px',
  },
  notFound404: {
    fontSize: '96px',
    fontWeight: 700,
    color: colors.neutral[200],
    lineHeight: 1,
    marginBottom: '16px',
  },
  notFoundTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: colors.neutral[800],
    marginBottom: '8px',
  },
  notFoundText: {
    fontSize: '14px',
    color: colors.neutral[500],
    marginBottom: '24px',
  },
  notFoundButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
    background: colors.brand.primary,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;
