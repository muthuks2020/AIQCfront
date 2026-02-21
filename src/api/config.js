/**
 * =============================================================================
 * API Configuration
 * =============================================================================
 * Central config for the entire app's API layer.
 * Toggle USE_MOCK_API to switch ALL services between mock and real backend.
 * =============================================================================
 */

export const USE_MOCK_API = true;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  odooUrl: import.meta.env.VITE_ODOO_API_URL || 'http://localhost:8069/api',
  timeout: 30000,
};

export const ENDPOINTS = {

  // ---------------------------------------------------------------------------
  // Maker — Inspection Execution
  // ---------------------------------------------------------------------------
  inspection: {
    queue:      '/inspection/queue',
    byId:       (id) => `/inspection/${id}`,
    start:      (id) => `/inspection/${id}/start`,
    submit:     (id) => `/inspection/${id}/submit`,
    saveDraft:  (id) => `/inspection/${id}/draft`,
    getForm:    (partCode) => `/inspection/forms/${partCode}`,
    readings:   (inspectionId) => `/inspection/${inspectionId}/readings`,
  },

  // ---------------------------------------------------------------------------
  // Checker — Validation & Review  (NEW)
  // ---------------------------------------------------------------------------
  checker: {
    // Dashboard
    dashboardStats:  '/checker/dashboard/stats',

    // Inspection list (filterable by status, search, priority, date range)
    inspections:     '/checker/inspections',
    inspectionById:  (id) => `/checker/inspections/${id}`,

    // Actions
    approve:         (id) => `/checker/inspections/${id}/approve`,
    reject:          (id) => `/checker/inspections/${id}/reject`,

    // History & audit trail
    history:         '/checker/history',
    auditTrail:      (id) => `/checker/inspections/${id}/audit-trail`,

    // Reports
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
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(localStorage.getItem('authToken') && {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  }),
});

export default {
  USE_MOCK_API,
  API_CONFIG,
  ENDPOINTS,
  getHeaders,
};
