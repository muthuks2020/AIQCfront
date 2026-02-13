// Re-export everything from the unified config
export {
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
  getHeaders,        // backward-compat alias for getAuthHeaders
  buildQueryString,
  formatFileSize,
  apiFetch,
  logApiCall,
} from './config';

// Backward-compat alias (old name → new name)
export { USE_MOCK_DATA as USE_MOCK_API } from './config';

export * from './inspectionService';
export * from './mockData';
export { default as inspectionService } from './inspectionService';