export const USE_MOCK_API = true;


export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  odooUrl: import.meta.env.VITE_ODOO_API_URL || 'http://localhost:8069/api',
  timeout: 30000,
};


export const ENDPOINTS = {

  inspection: {
    queue: '/inspection/queue',
    byId: (id) => `/inspection/${id}`,
    start: (id) => `/inspection/${id}/start`,
    submit: (id) => `/inspection/${id}/submit`,
    saveDraft: (id) => `/inspection/${id}/draft`,
    getForm: (partCode) => `/inspection/forms/${partCode}`,
    readings: (inspectionId) => `/inspection/${inspectionId}/readings`,
  },


  grn: {
    list: '/grn',
    byId: (id) => `/grn/${id}`,
    pending: '/grn/pending-qc',
  },


  components: {
    list: '/components',
    byPartCode: (code) => `/components/${code}`,
  },


  qcPlans: {
    list: '/qc-plans',
    byId: (id) => `/qc-plans/${id}`,
  },


  inspectionReports: {
    generate: (inspectionId) => `/inspection-reports/${inspectionId}/generate`,
    byId: (id) => `/inspection-reports/${id}`,
    list: '/inspection-reports',
  },
};


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
