/**
 * =============================================================================
 * Checker API Service
 * =============================================================================
 * Centralized API service for all Checker / Validation operations.
 * Follows the same architectural pattern as inspectionService.js so that
 * toggling USE_MOCK_API in src/api/config.js switches the entire Checker
 * flow from mock data to real backend calls — zero component changes needed.
 *
 * Usage in components / hooks:
 *   import { getCheckerInspections, approveInspection } from '../../api/checkerService';
 * =============================================================================
 */

import { USE_MOCK_API, API_CONFIG, ENDPOINTS, getHeaders } from './config';

// =============================================================================
// Core API Fetch Utility (shared pattern with inspectionService.js)
// =============================================================================

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        errorBody.message ||
        errorBody.error ||
        `HTTP error! status: ${response.status}`;

      const error = new Error(message);
      error.status = response.status;
      error.details = errorBody;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`[CheckerAPI] Error [${endpoint}]:`, error);
    throw error;
  }
};

// =============================================================================
// Mock helpers
// =============================================================================

const mockDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// Mock Data — keeps pages self-contained during development
// =============================================================================

const mockInspections = [
  {
    id: 'IRP-2026-00004',
    irNumber: 'IRP-2026-00004',
    irDate: '2026-02-05',
    queueNumber: 'QC-2026-00006',
    grnNumber: 'GRN-2026-00004',
    grnDate: '2026-02-04',
    poNumber: 'PO-2026-0201',
    vendorName: 'Sri Lakshmi Electronics Pvt Ltd',
    vendorCode: 'VND-001',
    supplierBillNo: 'INV-SLE-2026-078',
    partCode: 'BSC-TRD-001',
    partName: 'B-SCAN Ultrasound Transducer 3.5MHz',
    lotNumber: 'LOT-TRD-2026-05',
    lotSize: 60,
    sampleSize: 8,
    qualityPlanCode: 'RD.7.3-07',
    inspectionType: 'sampling',
    makerId: 'USR-002',
    makerName: 'Ravi Kumar',
    makerDept: 'Quality Control',
    makerDate: '2026-02-05T14:30:00',
    makerRemarks:
      'All visual and functional checks completed. 8/8 samples passed. Lot recommended for acceptance.',
    status: 'pending_review',
    priority: 'high',
    stages: [
      {
        name: 'Visual Inspection',
        totalChecked: 8,
        totalPassed: 8,
        totalFailed: 0,
        checkpoints: [
          { name: 'Surface Finish', specification: 'No visible scratches or dents', type: 'visual', result: 'pass', readings: Array(8).fill({ value: 'OK', status: 'pass' }) },
          { name: 'Label Verification', specification: 'Correct model number and serial', type: 'visual', result: 'pass', readings: Array(8).fill({ value: 'OK', status: 'pass' }) },
        ],
      },
      {
        name: 'Dimensional Check',
        totalChecked: 8,
        totalPassed: 8,
        totalFailed: 0,
        checkpoints: [
          {
            name: 'Housing Diameter', specification: '38.0 ± 0.2 mm', type: 'dimensional',
            nominal: 38.0, min: 37.8, max: 38.2, unit: 'mm', result: 'pass',
            readings: [
              { value: 38.01, status: 'pass' }, { value: 37.98, status: 'pass' },
              { value: 38.05, status: 'pass' }, { value: 38.0, status: 'pass' },
              { value: 37.95, status: 'pass' }, { value: 38.1, status: 'pass' },
              { value: 38.02, status: 'pass' }, { value: 37.99, status: 'pass' },
            ],
          },
        ],
      },
    ],
    checkerRemarks: '', checkerDate: null, checkerName: null,
    rejectionCategory: null, rejectionReason: null, rejectionCount: 0,
  },
  {
    id: 'IRP-2026-00003',
    irNumber: 'IRP-2026-00003',
    irDate: '2026-02-04',
    queueNumber: 'QC-2026-00005',
    grnNumber: 'GRN-2026-00003',
    grnDate: '2026-02-03',
    poNumber: 'PO-2026-0199',
    vendorName: 'Kasturi Electronics',
    vendorCode: 'VND-004',
    supplierBillNo: 'INV-KE-2026-045',
    partCode: 'AACS-173',
    partName: '3PIN GILLARD MALE & FEMALE',
    lotNumber: 'LOT-GIL-2026-02',
    lotSize: 300,
    sampleSize: 50,
    qualityPlanCode: 'RD.7.3-07-D1-01',
    inspectionType: 'sampling',
    makerId: 'USR-002',
    makerName: 'Ravi Kumar',
    makerDept: 'Quality Control',
    makerDate: '2026-02-04T11:00:00',
    makerRemarks: 'Visual and dimensional inspection completed. All 50 samples within tolerance.',
    status: 'pending_review',
    priority: 'normal',
    stages: [
      { name: 'Visual Inspection', totalChecked: 50, totalPassed: 50, totalFailed: 0, checkpoints: [{ name: 'Pin Alignment', specification: 'Pins aligned within ±0.1mm', type: 'visual', result: 'pass' }] },
    ],
    checkerRemarks: '', checkerDate: null, checkerName: null,
    rejectionCategory: null, rejectionReason: null, rejectionCount: 0,
  },
  {
    id: 'IRP-2026-00002',
    irNumber: 'IRP-2026-00002',
    irDate: '2026-02-03',
    queueNumber: 'QC-2026-00004',
    grnNumber: 'GRN-2026-00002',
    grnDate: '2026-02-02',
    poNumber: 'PO-2026-0188',
    vendorName: 'Plastic Coats',
    vendorCode: 'VND-002',
    supplierBillNo: 'INV-PC-2026-012',
    partCode: 'RCNA-001',
    partName: 'CHANNEL FRAME - REGULAR',
    lotNumber: 'LOT-CF-2026-01',
    lotSize: 50,
    sampleSize: 10,
    qualityPlanCode: 'RD.7.3-07-D1-01',
    inspectionType: 'sampling',
    makerId: 'USR-002',
    makerName: 'Ravi Kumar',
    makerDept: 'Quality Control',
    makerDate: '2026-02-03T09:30:00',
    makerRemarks: 'All 20 measurement checkpoints within tolerance.',
    status: 'approved',
    priority: 'high',
    stages: [{ name: 'Dimensional Check', totalChecked: 10, totalPassed: 10, totalFailed: 0, checkpoints: [] }],
    checkerRemarks: 'Verified all dimensional readings. Approved for store transfer.',
    checkerDate: '2026-02-03T15:45:00', checkerName: 'Priya Sharma',
    rejectionCategory: null, rejectionReason: null, rejectionCount: 0,
  },
  {
    id: 'IRP-2026-00001',
    irNumber: 'IRP-2026-00001',
    irDate: '2026-02-01',
    queueNumber: 'QC-2026-00002',
    grnNumber: 'GRN-2026-00001',
    grnDate: '2026-01-31',
    poNumber: 'PO-2026-0175',
    vendorName: 'T.K. Industries',
    vendorCode: 'VND-009',
    supplierBillNo: 'INV-TKI-2026-003',
    partCode: 'RSFA-061',
    partName: '3M.M HD WASHER',
    lotNumber: 'LOT-HDW-2026-01',
    lotSize: 1000,
    sampleSize: 90,
    qualityPlanCode: 'RD.7.3-07-D1-01',
    inspectionType: 'sampling',
    makerId: 'USR-002',
    makerName: 'Ravi Kumar',
    makerDept: 'Quality Control',
    makerDate: '2026-02-01T10:00:00',
    makerRemarks: 'Dimensional check showed 2 samples out of tolerance on OD measurement.',
    status: 'rejected',
    priority: 'normal',
    stages: [
      { name: 'Dimensional Check', totalChecked: 90, totalPassed: 88, totalFailed: 2, checkpoints: [{ name: 'Outer Diameter', specification: '3.0 ± 0.05 mm', type: 'dimensional', nominal: 3.0, min: 2.95, max: 3.05, unit: 'mm', result: 'fail' }] },
    ],
    checkerRemarks: 'OD out of spec on 2 samples. Rejected — return to vendor for rework.',
    checkerDate: '2026-02-01T16:20:00', checkerName: 'Priya Sharma',
    rejectionCategory: 'dimensional_failure',
    rejectionReason: 'OD measurement exceeds upper tolerance limit on 2 samples',
    rejectionCount: 1,
  },
];

// =============================================================================
// Mock Filter / Stats Helpers
// =============================================================================

const getMockInspections = (filters = {}) => {
  let items = [...mockInspections];
  if (filters.status && filters.status !== 'all') items = items.filter((i) => i.status === filters.status);
  if (filters.priority) items = items.filter((i) => i.priority === filters.priority);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((i) =>
      i.partName.toLowerCase().includes(q) || i.irNumber.toLowerCase().includes(q) ||
      i.makerName.toLowerCase().includes(q) || i.vendorName.toLowerCase().includes(q) ||
      i.partCode.toLowerCase().includes(q)
    );
  }
  if (filters.dateFrom) items = items.filter((i) => new Date(i.makerDate) >= new Date(filters.dateFrom));
  if (filters.dateTo) items = items.filter((i) => new Date(i.makerDate) <= new Date(filters.dateTo));
  items.sort((a, b) => new Date(b.makerDate) - new Date(a.makerDate));
  return items;
};

const getMockDashboardStats = () => {
  const pending  = mockInspections.filter((i) => i.status === 'pending_review').length;
  const approved = mockInspections.filter((i) => i.status === 'approved').length;
  const rejected = mockInspections.filter((i) => i.status === 'rejected').length;
  return {
    pendingCount: pending,
    approvedCount: approved,
    rejectedCount: rejected,
    totalReviewed: approved + rejected,
    avgReviewTimeMinutes: 18,
    passRate: ((approved / Math.max(approved + rejected, 1)) * 100).toFixed(1),
  };
};

// =============================================================================
// API — Dashboard Stats
// =============================================================================

export const getCheckerDashboardStats = async () => {
  if (USE_MOCK_API) {
    await mockDelay(300);
    return { success: true, data: getMockDashboardStats() };
  }
  return apiFetch(ENDPOINTS.checker.dashboardStats);
};

// =============================================================================
// API — Inspection List / Queue
// =============================================================================

export const getCheckerInspections = async (filters = {}) => {
  if (USE_MOCK_API) {
    await mockDelay(400);
    const items = getMockInspections(filters);
    return {
      success: true,
      data: items,
      pagination: { total: items.length, page: filters.page || 1, pageSize: filters.pageSize || 20, totalPages: Math.ceil(items.length / (filters.pageSize || 20)) },
    };
  }
  const qp = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v != null && v !== '') qp.append(k, v); });
  const qs = qp.toString();
  return apiFetch(qs ? `${ENDPOINTS.checker.inspections}?${qs}` : ENDPOINTS.checker.inspections);
};

export const getPendingInspections  = (f = {}) => getCheckerInspections({ ...f, status: 'pending_review' });
export const getApprovedInspections = (f = {}) => getCheckerInspections({ ...f, status: 'approved' });
export const getRejectedInspections = (f = {}) => getCheckerInspections({ ...f, status: 'rejected' });

// =============================================================================
// API — Single Inspection Detail
// =============================================================================

export const getInspectionDetail = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay(300);
    const ins = mockInspections.find((i) => i.id === inspectionId);
    if (!ins) throw new Error(`Inspection not found: ${inspectionId}`);
    return { success: true, data: ins };
  }
  return apiFetch(ENDPOINTS.checker.inspectionById(inspectionId));
};

// =============================================================================
// API — Approve / Reject Actions
// =============================================================================

export const approveInspection = async (inspectionId, payload) => {
  if (USE_MOCK_API) {
    await mockDelay(600);
    console.log('[CheckerAPI MOCK] Approve:', inspectionId, payload);
    const idx = mockInspections.findIndex((i) => i.id === inspectionId);
    if (idx !== -1) {
      mockInspections[idx] = {
        ...mockInspections[idx],
        status: 'approved',
        checkerRemarks: payload.checkerRemarks || payload.remarks || '',
        checkerDate: new Date().toISOString(),
        checkerName: payload.checkerName,
      };
    }
    return {
      success: true, message: 'Inspection approved successfully',
      data: { id: inspectionId, status: 'approved', checkerRemarks: payload.checkerRemarks || payload.remarks || '', checkerDate: new Date().toISOString(), checkerName: payload.checkerName },
    };
  }
  return apiFetch(ENDPOINTS.checker.approve(inspectionId), { method: 'POST', body: JSON.stringify(payload) });
};

export const rejectInspection = async (inspectionId, payload) => {
  if (USE_MOCK_API) {
    await mockDelay(600);
    console.log('[CheckerAPI MOCK] Reject:', inspectionId, payload);
    const idx = mockInspections.findIndex((i) => i.id === inspectionId);
    if (idx !== -1) {
      mockInspections[idx] = {
        ...mockInspections[idx],
        status: 'rejected',
        checkerRemarks: payload.checkerRemarks || payload.remarks || '',
        checkerDate: new Date().toISOString(),
        checkerName: payload.checkerName,
        rejectionCategory: payload.rejectionCategory || '',
        rejectionReason: payload.rejectionReason || '',
        rejectionCount: (mockInspections[idx].rejectionCount || 0) + 1,
        returnedToMaker: true,
      };
    }
    return {
      success: true, message: 'Inspection rejected and returned to maker',
      data: {
        id: inspectionId, status: 'rejected',
        checkerRemarks: payload.checkerRemarks || payload.remarks || '',
        checkerDate: new Date().toISOString(), checkerName: payload.checkerName,
        rejectionCategory: payload.rejectionCategory, rejectionReason: payload.rejectionReason,
        returnedToMaker: payload.returnToMaker !== false,
      },
    };
  }
  return apiFetch(ENDPOINTS.checker.reject(inspectionId), { method: 'POST', body: JSON.stringify(payload) });
};

// =============================================================================
// API — History / Audit Trail
// =============================================================================

export const getCheckerHistory = async (filters = {}) => {
  if (USE_MOCK_API) {
    await mockDelay(400);
    const reviewed = mockInspections.filter((i) => i.status === 'approved' || i.status === 'rejected');
    return { success: true, data: reviewed, pagination: { total: reviewed.length, page: 1, pageSize: 20, totalPages: 1 } };
  }
  const qs = new URLSearchParams(filters).toString();
  return apiFetch(qs ? `${ENDPOINTS.checker.history}?${qs}` : ENDPOINTS.checker.history);
};

export const getInspectionAuditTrail = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay(300);
    return {
      success: true,
      data: [
        { action: 'submitted_for_review', user: 'Ravi Kumar', role: 'maker', timestamp: '2026-02-05T14:30:00', remarks: 'Submitted for checker review' },
        { action: 'review_started', user: 'Priya Sharma', role: 'checker', timestamp: '2026-02-05T15:00:00', remarks: 'Review in progress' },
      ],
    };
  }
  return apiFetch(ENDPOINTS.checker.auditTrail(inspectionId));
};

// =============================================================================
// API — Reports
// =============================================================================

export const getInspectionReport = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay(800);
    return { success: true, data: { inspectionId, pdfUrl: `/reports/ir-${inspectionId}.pdf`, generatedAt: new Date().toISOString() } };
  }
  return apiFetch(ENDPOINTS.checker.report(inspectionId));
};

// =============================================================================
// Default Export
// =============================================================================

export default {
  getCheckerDashboardStats,
  getCheckerInspections, getPendingInspections, getApprovedInspections, getRejectedInspections,
  getInspectionDetail,
  approveInspection, rejectInspection,
  getCheckerHistory, getInspectionAuditTrail,
  getInspectionReport,
};
