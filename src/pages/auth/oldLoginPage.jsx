import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, ArrowRight, Shield, ClipboardCheck, CheckCircle, Building2 } from 'lucide-react';
import { useAuth, USER_ROLES, ROLE_INFO } from '../../contexts/AuthContext';
import { colors, shadows, borderRadius, transitions } from '../../constants/theme';


const APPASAMY_LOGO_URL = 'https://cdn.prod.website-files.com/637e4dc883878debd9d96de4/63df53786bf1b137a5731bb2_AA%20Logo(1).png';


const LoginPage = ({ onLoginSuccess }) => {
  const { login, loginWithSSO, ssoEnabled, isLoading, error: authError, dummyUsers } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);


  useEffect(() => {
    if (error) setError('');
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      onLoginSuccess?.(result.user);
    } else {
      setError(result.error || 'Login failed');
    }

    setIsSubmitting(false);
  };

  const handleDemoLogin = async (role) => {
    const user = dummyUsers[role];
    if (user) {
      setActiveDemo(role);
      setFormData({ username: user.username, password: user.password });


      setTimeout(async () => {
        const result = await login(user.username, user.password);
        if (result.success) {
          onLoginSuccess?.(result.user);
        }
        setActiveDemo(null);
      }, 500);
    }
  };

  const handleSSOLogin = async () => {
    if (!ssoEnabled) {
      setError('SSO is not yet configured. Please use username/password login.');
      return;
    }
    await loginWithSSO();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return Shield;
      case USER_ROLES.MAKER: return ClipboardCheck;
      case USER_ROLES.CHECKER: return CheckCircle;
      default: return Shield;
    }
  };

  return (
    <div style={styles.container}>
      {}
      <div style={styles.backgroundPattern}>
        <div style={styles.gradientOverlay} />
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...styles.floatingOrb, ...getOrbStyle(i) }} />
        ))}
      </div>

      {}
      <div style={styles.content}>
        {}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            {}
            <div style={styles.logoContainer}>
              <img
                src={APPASAMY_LOGO_URL}
                alt="Appasamy Associates"
                style={styles.logo}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ ...styles.logoFallback, display: 'none' }}>
                <Building2 size={48} color="white" />
                <span style={styles.logoText}>APPASAMY</span>
              </div>
            </div>

            {}
            <h1 style={styles.brandTitle}>
              Quality Control
              <span style={styles.brandSubtitle}>Management System</span>
            </h1>

            {}
            <p style={styles.brandDescription}>
              Streamlined quality assurance for B-SCAN products with real-time
              Odoo ERP integration. Zero manual intervention, 100% compliance guaranteed.
            </p>

            {}
            <div style={styles.features}>
              {[
                'Real-time Inspection Tracking',
                'Maker-Checker-Approver Workflow',
                'Complete Audit Trail',
                'Integrated Vendor Returns'
              ].map((feature, idx) => (
                <div key={idx} style={styles.featureItem}>
                  <CheckCircle size={16} color="#00A0E3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {}
            <div style={styles.brandFooter}>
              <p>Empowering Vision Since 1978</p>
              <p style={styles.copyright}>© 2026 Appasamy Associates. All rights reserved.</p>
            </div>
          </div>
        </div>

        {}
        <div style={styles.formPanel}>
          <div style={styles.formContainer}>
            {}
            <div style={styles.mobileLogo}>
              <img
                src={APPASAMY_LOGO_URL}
                alt="Appasamy Associates"
                style={styles.mobileLogoImg}
              />
            </div>

            {}
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Welcome Back</h2>
              <p style={styles.formSubtitle}>Sign in to access the QC Management System</p>
            </div>

            {}
            {(error || authError) && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>!</span>
                <span>{error || authError}</span>
              </div>
            )}

            {}
            <form onSubmit={handleSubmit} style={styles.form}>
              {}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  style={styles.input}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>

              {}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    style={styles.input}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                style={{
                  ...styles.submitButton,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {}
            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or continue with</span>
              <span style={styles.dividerLine} />
            </div>

            <button
              onClick={handleSSOLogin}
              style={styles.ssoButton}
              disabled={isSubmitting}
            >
              <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Microsoft Office 365</span>
            </button>

            {}
            <div style={styles.demoSection}>
              <p style={styles.demoTitle}>Quick Demo Access</p>
              <div style={styles.demoButtons}>
                {Object.entries(ROLE_INFO).map(([role, info]) => {
                  const Icon = getRoleIcon(role);
                  const isActive = activeDemo === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleDemoLogin(role)}
                      disabled={isSubmitting}
                      style={{
                        ...styles.demoButton,
                        borderColor: info.color,
                        background: isActive ? info.color : 'transparent',
                        color: isActive ? 'white' : info.color,
                      }}
                    >
                      <Icon size={14} />
                      <span>{info.name.split(' ')[0]}</span>
                      <ArrowRight size={12} />
                    </button>
                  );
                })}
              </div>
              <p style={styles.demoHint}>
                Click any role above to login with demo credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const getOrbStyle = (index) => {
  const sizes = [300, 250, 200, 350, 280, 220];
  const positions = [
    { top: '-10%', left: '-5%' },
    { top: '60%', left: '10%' },
    { top: '30%', left: '-8%' },
    { top: '-5%', left: '30%' },
    { top: '70%', left: '25%' },
    { top: '40%', left: '5%' },
  ];
  const delays = [0, 2, 4, 1, 3, 5];

  return {
    width: sizes[index],
    height: sizes[index],
    ...positions[index],
    animationDelay: `${delays[index]}s`,
  };
};


const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  backgroundPattern: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(135deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 50%, ${colors.brand.secondary} 100%)`,
    zIndex: 0,
  },

  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 30% 20%, rgba(0, 160, 227, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },

  floatingOrb: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(0, 160, 227, 0.08), rgba(0, 102, 204, 0.03))',
    filter: 'blur(40px)',
    animation: 'float 20s ease-in-out infinite',
    pointerEvents: 'none',
  },

  content: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },


  brandPanel: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: 'white',
    '@media (max-width: 968px)': {
      display: 'none',
    },
  },

  brandContent: {
    maxWidth: '500px',
  },

  logoContainer: {
    marginBottom: '40px',
  },

  logo: {
    height: '60px',
    width: 'auto',
    filter: 'brightness(0) invert(1)',
  },

  logoFallback: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  logoText: {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '2px',
  },

  brandTitle: {
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  brandSubtitle: {
    fontSize: '28px',
    fontWeight: 400,
    opacity: 0.9,
    color: colors.accent,
  },

  brandDescription: {
    fontSize: '16px',
    lineHeight: 1.7,
    opacity: 0.85,
    marginBottom: '32px',
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '48px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    opacity: 0.9,
  },

  brandFooter: {
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: '13px',
    opacity: 0.7,
  },

  copyright: {
    marginTop: '8px',
    fontSize: '12px',
    opacity: 0.5,
  },


  formPanel: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'white',
    borderTopLeftRadius: '32px',
    borderBottomLeftRadius: '32px',
    boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
  },

  formContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
  },

  mobileLogo: {
    display: 'none',
    marginBottom: '32px',
    textAlign: 'center',
  },

  mobileLogoImg: {
    height: '48px',
    width: 'auto',
  },

  formHeader: {
    marginBottom: '32px',
    textAlign: 'center',
  },

  formTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: colors.neutral[800],
    marginBottom: '8px',
  },

  formSubtitle: {
    fontSize: '14px',
    color: colors.neutral[500],
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: colors.dangerLight,
    borderRadius: borderRadius.lg,
    marginBottom: '24px',
    color: colors.danger,
    fontSize: '14px',
  },

  errorIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: colors.danger,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.neutral[700],
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    outline: 'none',
    transition: transitions.normal,
    background: colors.neutral[50],
  },

  passwordWrapper: {
    position: 'relative',
  },

  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.neutral[400],
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'white',
    background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: transitions.normal,
    boxShadow: shadows.primary,
    marginTop: '8px',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: colors.neutral[200],
  },

  dividerText: {
    fontSize: '12px',
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  ssoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    color: colors.neutral[700],
    background: 'white',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: transitions.normal,
  },

  demoSection: {
    marginTop: '32px',
    padding: '20px',
    background: colors.neutral[50],
    borderRadius: borderRadius.xl,
    border: `1px dashed ${colors.neutral[200]}`,
  },

  demoTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
    textAlign: 'center',
  },

  demoButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  demoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1.5px solid',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: transitions.normal,
    background: 'transparent',
  },

  demoHint: {
    fontSize: '11px',
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: '12px',
  },
};


const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(10px, -10px) rotate(5deg); }
    50% { transform: translate(-5px, 15px) rotate(-5deg); }
    75% { transform: translate(-15px, 5px) rotate(3deg); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  input:focus {
    border-color: ${colors.brand.primary} !important;
    background: white !important;
    box-shadow: 0 0 0 3px ${colors.brand.primary}15 !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .sso-button:hover {
    background: ${colors.neutral[50]} !important;
    border-color: ${colors.neutral[300]} !important;
  }

  @media (max-width: 968px) {
    .brand-panel { display: none !important; }
    .form-panel {
      border-radius: 0 !important;
      flex: 1 !important;
    }
    .mobile-logo { display: block !important; }
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;
