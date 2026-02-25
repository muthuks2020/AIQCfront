

export const USE_MOCK_API = false;

export const API_CONFIG = {

  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  odooUrl: import.meta.env.VITE_ODOO_API_URL || 'http://localhost:8069/api',
  timeout: 30000,
};

export const ENDPOINTS = {

 
  inspection: {
    queue:      '/inspection/queue',                                      // GET  — list queue
    byId:       (id) => `/inspection/queue/${id}`,                        // GET  — queue detail  ← FIXED (was /inspection/${id})
    start:      (id) => `/inspection/queue/${id}/start`,                  // POST — start         ← FIXED
    form:       (id) => `/inspection/queue/${id}/form`,                   // GET  — inspection form ← NEW
    hold:       (id) => `/inspection/queue/${id}/hold`,                   // POST — put on hold   ← NEW
    resume:     (id) => `/inspection/queue/${id}/resume`,                 // POST — resume        ← NEW
    assign:     (id) => `/inspection/queue/${id}/assign`,                 // POST — assign        ← NEW
    submitResult: '/inspection/results',                                  // POST — submit result ← FIXED (was /inspection/${id}/submit)
    saveDraft:  (id) => `/inspection/results/${id}/save-draft`,           // POST — save draft    ← FIXED
    readings:   (inspectionId) => `/inspection/${inspectionId}/readings`, // GET  — readings
  },

  // ---------------------------------------------------------------------------
  // Checker — Validation & Review
  // ---------------------------------------------------------------------------
  checker: {
    dashboardStats:  '/checker/dashboard/stats',
    inspections:     '/checker/inspections',
    inspectionById:  (id) => `/checker/inspections/${id}`,
    approve:         (id) => `/checker/inspections/${id}/approve`,
    reject:          (id) => `/checker/inspections/${id}/reject`,
    history:         '/checker/history',
    auditTrail:      (id) => `/checker/inspections/${id}/audit-trail`,
    report:          (id) => `/checker/inspections/${id}/report`,
  },

  // ---------------------------------------------------------------------------
  // GRN
  // ---------------------------------------------------------------------------
  grn: {
    list:       '/grn',
    byId:       (id) => `/grn/${id}`,
    pending:    '/grn/pending-qc',
  },

  // ---------------------------------------------------------------------------
  // Components
  // ---------------------------------------------------------------------------
  components: {
    list:       '/components',
    byPartCode: (code) => `/components/${code}`,
  },

  // ---------------------------------------------------------------------------
  // QC Plans
  // ---------------------------------------------------------------------------
  qcPlans: {
    list: '/qc-plans',
    byId: (id) => `/qc-plans/${id}`,
  },

  // ---------------------------------------------------------------------------
  // Inspection Reports
  // ---------------------------------------------------------------------------
  inspectionReports: {
    generate: (inspectionId) => `/inspection-reports/${inspectionId}/generate`,
    byId:     (id) => `/inspection-reports/${id}`,
    list:     '/inspection-reports',
  },
};

// ---------------------------------------------------------------------------
// Auth Headers
// ---------------------------------------------------------------------------
// ✅ FIX #4: Include X-User-Id, X-User-Name, X-User-Role, X-User-Email
//    The backend auth_middleware requires these headers:
//      - Authorization: Bearer <token>        → authenticates the request
//      - X-User-Id                            → required or 401
//      - X-User-Name, X-User-Role, X-User-Email → used for audit/authorization
// ---------------------------------------------------------------------------
export const getHeaders = () => {
  // Try to read user info from the same localStorage key AuthContext uses
  let user = {};
  try {
    const savedAuth = localStorage.getItem('appasamy_qc_auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      user = parsed.user || {};
    }
  } catch (e) {
    // Ignore parse errors
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Auth token
    ...(localStorage.getItem('authToken') && {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    }),
    // User context headers (required by backend)
    'X-User-Id':    String(user.id || user.userId || '1'),
    'X-User-Name':  user.name || 'Admin User',
    'X-User-Role':  user.role || 'maker',
    'X-User-Email': user.email || '',
  };
};

export default {
  USE_MOCK_API,
  API_CONFIG,
  ENDPOINTS,
  getHeaders,
};
