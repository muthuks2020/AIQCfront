export const USE_MOCK_DATA = true;


export const API_BASE_URL = '/api/v1';


export const COMPONENT_MASTER_ENDPOINTS = {


  categories: `${API_BASE_URL}/component-master/categories`,
  productGroups: `${API_BASE_URL}/component-master/product-groups`,
  samplingPlans: `${API_BASE_URL}/component-master/sampling-plans`,
  qcPlans: `${API_BASE_URL}/component-master/qc-plans`,


  components: `${API_BASE_URL}/component-master/components`,
  componentById: (id) => `${API_BASE_URL}/component-master/components/${id}`,


  duplicateComponent: (id) => `${API_BASE_URL}/component-master/components/${id}/duplicate`,
  validatePartCode: `${API_BASE_URL}/component-master/validate-part-code`,


  upload: `${API_BASE_URL}/component-master/upload`,
  export: `${API_BASE_URL}/component-master/components/export`,
  import: `${API_BASE_URL}/component-master/components/import`,
};


export const GATE_ENTRY_ENDPOINTS = {
  base: `${API_BASE_URL}/gate-entry`,
  entries: `${API_BASE_URL}/gate-entry/entries`,
  entryById: (id) => `${API_BASE_URL}/gate-entry/entries/${id}`,
  poLookup: `${API_BASE_URL}/gate-entry/po-lookup`,
  vendors: `${API_BASE_URL}/gate-entry/vendors`,
};

export const GRN_ENDPOINTS = {
  base: `${API_BASE_URL}/grn`,
  list: `${API_BASE_URL}/grn/list`,
  grnById: (id) => `${API_BASE_URL}/grn/${id}`,
  create: `${API_BASE_URL}/grn/create`,
  approve: (id) => `${API_BASE_URL}/grn/${id}/approve`,
};

export const INSPECTION_ENDPOINTS = {
  base: `${API_BASE_URL}/inspection`,
  queue: `${API_BASE_URL}/inspection/queue`,
  queueById: (id) => `${API_BASE_URL}/inspection/queue/${id}`,
  visual: `${API_BASE_URL}/inspection/visual`,
  functional: `${API_BASE_URL}/inspection/functional`,
  saveResult: `${API_BASE_URL}/inspection/save-result`,
  report: `${API_BASE_URL}/inspection/report`,
};

export const VENDOR_RETURN_ENDPOINTS = {
  base: `${API_BASE_URL}/vendor-return`,
  list: `${API_BASE_URL}/vendor-return/list`,
  returnById: (id) => `${API_BASE_URL}/vendor-return/${id}`,
  create: `${API_BASE_URL}/vendor-return/create`,
  approve: (id) => `${API_BASE_URL}/vendor-return/${id}/approve`,
  reject: (id) => `${API_BASE_URL}/vendor-return/${id}/reject`,
};

export const DASHBOARD_ENDPOINTS = {
  summary: `${API_BASE_URL}/dashboard/summary`,
  inspectionStats: `${API_BASE_URL}/dashboard/inspection-stats`,
  recentActivity: `${API_BASE_URL}/dashboard/recent-activity`,
  alerts: `${API_BASE_URL}/dashboard/alerts`,
};


export const API_ENDPOINTS = {
  componentMaster: COMPONENT_MASTER_ENDPOINTS,
  gateEntry: GATE_ENTRY_ENDPOINTS,
  grn: GRN_ENDPOINTS,
  inspection: INSPECTION_ENDPOINTS,
  vendorReturn: VENDOR_RETURN_ENDPOINTS,
  dashboard: DASHBOARD_ENDPOINTS,
};


export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const PAGINATION_CONFIG = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 48, 96],
  maxPageSize: 100,
};

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024,
  maxFileSizeDisplay: '5MB',
  documentExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
  importExtensions: ['.xlsx', '.xls', '.csv'],
  documentMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  importMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
};


export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};


export const getMultipartHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};


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


export default {
  USE_MOCK_DATA,
  API_BASE_URL,
  API_ENDPOINTS,
  COMPONENT_MASTER_ENDPOINTS,
  API_CONFIG,
  PAGINATION_CONFIG,
  FILE_UPLOAD_CONFIG,
  getAuthHeaders,
  getMultipartHeaders,
  buildQueryString,
  formatFileSize,
};
