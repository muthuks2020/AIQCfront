

// ---------------------------------------------------------------------------
// 1. Feature flags
// ---------------------------------------------------------------------------
export const USE_MOCK_DATA = false; // Master mock toggle for the entire app

// ---------------------------------------------------------------------------
// 2. Core API configuration (reads from Vite env vars)
// ---------------------------------------------------------------------------
export const API_CONFIG = {
  baseUrl:  import.meta.env.VITE_API_URL      || '/api/v1',
  odooUrl:  import.meta.env.VITE_ODOO_API_URL  || 'http://localhost:8069/api',
  timeout:       30000,
  retryAttempts: 3,
  retryDelay:    1000,
  logApiCalls:   import.meta.env.DEV, // auto-enable logging in dev mode
};

// ---------------------------------------------------------------------------
// 3. Auth headers (most complete version — includes X-User-* for backend)
// ---------------------------------------------------------------------------
const _getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const user = _getUser();
  return {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'X-User-Id':    String(user.id    || localStorage.getItem('userId')    || '1'),
    'X-User-Name':  user.name  || localStorage.getItem('userName')  || 'Admin User',
    'X-User-Role':  user.role  || localStorage.getItem('userRole')  || 'admin',
    'X-User-Email': user.email || localStorage.getItem('userEmail') || 'admin@appasamy.com',
  };
};

export const getMultipartHeaders = () => {
  const token = localStorage.getItem('authToken');
  const user = _getUser();
  return {
    'Accept': 'application/json',
    // NOTE: Do NOT set Content-Type — browser sets it with boundary for FormData
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'X-User-Id':    String(user.id    || localStorage.getItem('userId')    || '1'),
    'X-User-Name':  user.name  || localStorage.getItem('userName')  || 'Admin User',
    'X-User-Role':  user.role  || localStorage.getItem('userRole')  || 'admin',
    'X-User-Email': user.email || localStorage.getItem('userEmail') || 'admin@appasamy.com',
  };
};

// Backward-compat alias used by inspectionService.js
export const getHeaders = getAuthHeaders;

// ---------------------------------------------------------------------------
// 4. Pagination config
// ---------------------------------------------------------------------------
export const PAGINATION_CONFIG = {
  defaultPageSize:  12,
  pageSizeOptions:  [12, 24, 48, 96],
  maxPageSize:      100,
};

// ---------------------------------------------------------------------------
// 5. File upload config
// ---------------------------------------------------------------------------
export const FILE_UPLOAD_CONFIG = {
  maxFileSize:        5 * 1024 * 1024,
  maxFileSizeDisplay: '5MB',
  documentExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
  importExtensions:   ['.xlsx', '.xls', '.csv'],
  documentMimeTypes:  ['application/pdf', 'image/png', 'image/jpeg'],
  importMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
};

// ---------------------------------------------------------------------------
// 6. Module-specific endpoints
//    Each module defines RELATIVE paths. Prepend API_CONFIG.baseUrl at call site.
//    Functions use the baseUrl so they produce full paths.
// ---------------------------------------------------------------------------
const BASE = API_CONFIG.baseUrl;

// -- Component Master (real, working endpoints matching the Flask backend) ---
export const COMPONENT_ENDPOINTS = {
  components:        `${BASE}/components`,
  componentById:     (id) => `${BASE}/components/${id}`,
  duplicateComponent:(id) => `${BASE}/components/${id}/duplicate`,
  validatePartCode:  `${BASE}/components/validate-part-code`,
  uploadDocument:    `${BASE}/components/upload-document`,
  deleteDocument:    (docId) => `${BASE}/components/documents/${docId}`,
  exportComponents:  `${BASE}/components/export`,

  // Lookups
  lookupCategories:    `${BASE}/lookups/categories`,
  lookupGroups:        `${BASE}/lookups/groups`,
  lookupUnits:         `${BASE}/lookups/units`,
  lookupInstruments:   `${BASE}/lookups/instruments`,
  lookupVendors:       `${BASE}/lookups/vendors`,
  lookupSamplingPlans: `${BASE}/lookups/sampling-plans`,
  lookupQcPlans:       `${BASE}/lookups/qc-plans`,
  lookupDepartments:   `${BASE}/lookups/departments`,

  // Sampling Plans (inline creation)
  samplingPlans:       `${BASE}/sampling-plans`,
};

// -- Inspection --
export const INSPECTION_ENDPOINTS = {
  queue:      '/inspection/queue',
  byId:       (id) => `/inspection/${id}`,
  start:      (id) => `/inspection/${id}/start`,
  submit:     (id) => `/inspection/${id}/submit`,
  saveDraft:  (id) => `/inspection/${id}/draft`,
  getForm:    (partCode) => `/inspection/forms/${partCode}`,
  readings:   (inspectionId) => `/inspection/${inspectionId}/readings`,
};

// -- GRN --
export const GRN_ENDPOINTS = {
  list:    '/grn',
  byId:    (id) => `/grn/${id}`,
  pending: '/grn/pending-qc',
};

// -- Inspection Reports --
export const REPORT_ENDPOINTS = {
  generate: (inspectionId) => `/inspection-reports/${inspectionId}/generate`,
  byId:     (id) => `/inspection-reports/${id}`,
  list:     '/inspection-reports',
};

// -- Future modules (placeholders — update paths when backends are ready) --
export const GATE_ENTRY_ENDPOINTS = {
  entries:    `${BASE}/gate-entry/entries`,
  entryById:  (id) => `${BASE}/gate-entry/entries/${id}`,
  poLookup:   `${BASE}/gate-entry/po-lookup`,
  vendors:    `${BASE}/gate-entry/vendors`,
};

export const VENDOR_RETURN_ENDPOINTS = {
  list:       `${BASE}/vendor-return/list`,
  returnById: (id) => `${BASE}/vendor-return/${id}`,
  create:     `${BASE}/vendor-return/create`,
  approve:    (id) => `${BASE}/vendor-return/${id}/approve`,
  reject:     (id) => `${BASE}/vendor-return/${id}/reject`,
};

export const DASHBOARD_ENDPOINTS = {
  summary:         `${BASE}/dashboard/summary`,
  inspectionStats: `${BASE}/dashboard/inspection-stats`,
  recentActivity:  `${BASE}/dashboard/recent-activity`,
  alerts:          `${BASE}/dashboard/alerts`,
};

// Convenience: grouped export for quick access
export const ENDPOINTS = {
  components:    COMPONENT_ENDPOINTS,
  inspection:    INSPECTION_ENDPOINTS,
  grn:           GRN_ENDPOINTS,
  reports:       REPORT_ENDPOINTS,
  gateEntry:     GATE_ENTRY_ENDPOINTS,
  vendorReturn:  VENDOR_RETURN_ENDPOINTS,
  dashboard:     DASHBOARD_ENDPOINTS,
};

// ---------------------------------------------------------------------------
// 7. Utility helpers
// ---------------------------------------------------------------------------
export const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ---------------------------------------------------------------------------
// 8. Shared apiFetch — centralised fetch with error handling
//    Import this in module API files instead of writing your own.
// ---------------------------------------------------------------------------
export const apiFetch = async (url, options = {}) => {
  const isMultipart = options.body instanceof FormData;
  const headers = isMultipart ? getMultipartHeaders() : getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    let message =
      errorBody.message || errorBody.error || `API Error: ${response.status} ${response.statusText}`;

    if (errorBody.errors) {
      const details =
        typeof errorBody.errors === 'object'
          ? Array.isArray(errorBody.errors)
            ? errorBody.errors
                .map((e) => (typeof e === 'object' ? `${e.field}: ${e.message}` : String(e)))
                .join(', ')
            : Object.entries(errorBody.errors)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
          : String(errorBody.errors);
      message += ` — ${details}`;
    }

    if (API_CONFIG.logApiCalls) {
      console.error('[apiFetch Error]', response.status, url, errorBody);
    }

    const error = new Error(message);
    error.status = response.status;
    error.details = errorBody;
    throw error;
  }

  // Handle non-JSON responses (e.g. file downloads)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response;
};

// ---------------------------------------------------------------------------
// 9. Logging helper
// ---------------------------------------------------------------------------
export const logApiCall = (method, url, data = null) => {
  if (API_CONFIG.logApiCalls) {
    console.log(`[API ${USE_MOCK_DATA ? 'MOCK' : 'LIVE'}] ${method} ${url}`, data || '');
  }
};

// ---------------------------------------------------------------------------
// Default export (backward compat)
// ---------------------------------------------------------------------------
export default {
  USE_MOCK_DATA,
  API_CONFIG,
  ENDPOINTS,
  COMPONENT_ENDPOINTS,
  INSPECTION_ENDPOINTS,
  GRN_ENDPOINTS,
  REPORT_ENDPOINTS,
  PAGINATION_CONFIG,
  FILE_UPLOAD_CONFIG,
  getAuthHeaders,
  getMultipartHeaders,
  getHeaders,
  buildQueryString,
  formatFileSize,
  apiFetch,
  logApiCall,
};
