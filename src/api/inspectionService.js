import { USE_MOCK_API, API_CONFIG, ENDPOINTS, getHeaders } from './config';
import {
  getMockInspectionQueue,
  getMockBatchDetails,
  getMockSavedReadings
} from './mockData';
import { getInspectionForm } from '../data/inspection-forms';


// ---------------------------------------------------------------------------
// Core API fetch helper
// ---------------------------------------------------------------------------
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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));


// ---------------------------------------------------------------------------
// Transform backend /form response → flat format expected by useInspection hook
// ---------------------------------------------------------------------------
const transformFormResponse = (apiData, localForm) => {
  const q = apiData.queue || apiData.data?.queue || {};
  const grn = q.grn || {};
  const comp = q.component || {};
  const vendor = q.vendor || {};
  const plan = q.qc_plan || {};

  return {
    // Batch info fields (flat, matches mockBatchDetails shape)
    id:              q.id,
    irNumber:        null,                              // not yet generated
    irDate:          null,
    poNumber:        grn.po_number || null,
    poDate:          grn.po_date || null,
    grnNumber:       grn.grn_number || null,
    grnDate:         grn.grn_date || null,
    vendorDcNo:      grn.dc_number || null,
    vendorDcDate:    grn.dc_date || null,
    partCode:        comp.part_code || null,
    partName:        comp.part_name || null,
    vendor: {
      id:      vendor.id,
      name:    vendor.vendor_name,
      code:    vendor.vendor_code,
    },
    prProcessCode:   null,
    lotSize:         q.lot_size,
    sampleSize:      q.sample_size,
    samplingPlanNo:  plan.plan_code || null,
    qualityPlanNo:   plan.plan_code || null,
    batchNo:         q.queue_number || null,
    documentRef:     null,
    inspectionType:  q.inspection_type,
    status:          q.status,

    // Inspection form — prefer local JSON, fall back to backend checking params
    inspectionForm:  localForm || null,

    // Saved readings — null for new inspections
    savedReadings:   null,

    // Pass through existing results from backend
    existingResults: apiData.existing_results || [],
  };
};


// ---------------------------------------------------------------------------
// API: Get inspection queue list
// ---------------------------------------------------------------------------
export const getInspectionQueue = async (filters = {}) => {
  if (USE_MOCK_API) {
    await mockDelay();
    return getMockInspectionQueue(filters);
  }

  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams
    ? `${ENDPOINTS.inspection.queue}?${queryParams}`
    : ENDPOINTS.inspection.queue;

  return apiFetch(endpoint);
};


// ---------------------------------------------------------------------------
// API: Get inspection by ID  ← KEY FIX: calls /form endpoint & transforms
// ---------------------------------------------------------------------------
export const getInspectionById = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay();
    const batchDetails = getMockBatchDetails(inspectionId);

    if (!batchDetails) {
      throw new Error(`Inspection not found: ${inspectionId}`);
    }

    const inspectionForm = getInspectionForm(batchDetails.partCode);
    const savedReadings = getMockSavedReadings(inspectionId);

    return {
      ...batchDetails,
      inspectionForm,
      savedReadings,
    };
  }

  // ── Real API call ──
  // Call the /form endpoint (returns queue + component checking_params + plan stages)
  const response = await apiFetch(ENDPOINTS.inspection.form(inspectionId));
  const apiData = response.data || response;

  // Get partCode from the response to load local inspection form JSON
  const partCode = apiData.queue?.component?.part_code
    || apiData.component?.part_code
    || null;

  // Load the local inspection form (checkpoints/parameters from JSON files)
  const localForm = partCode ? getInspectionForm(partCode) : null;

  // Transform nested backend response → flat format the hook expects
  return transformFormResponse(apiData, localForm);
};


// ---------------------------------------------------------------------------
// API: Start inspection
// ---------------------------------------------------------------------------
export const startInspection = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay();
    return {
      success: true,
      message: 'Inspection started',
      inspectionId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
  }

  return apiFetch(ENDPOINTS.inspection.start(inspectionId), {
    method: 'POST',
  });
};


// ---------------------------------------------------------------------------
// API: Save draft readings
// ---------------------------------------------------------------------------
export const saveDraftReadings = async (inspectionId, readingsData) => {
  if (USE_MOCK_API) {
    await mockDelay(500);
    console.log('Saving draft readings:', { inspectionId, readingsData });
    return {
      success: true,
      message: 'Draft saved successfully',
      inspectionId,
      savedAt: new Date().toISOString(),
    };
  }

  return apiFetch(ENDPOINTS.inspection.saveDraft(inspectionId), {
    method: 'POST',
    body: JSON.stringify(readingsData),
  });
};


// ---------------------------------------------------------------------------
// API: Submit inspection results
// ---------------------------------------------------------------------------
export const submitInspection = async (inspectionId, submissionData) => {
  if (USE_MOCK_API) {
    await mockDelay(800);
    console.log('Submitting inspection:', { inspectionId, submissionData });

    const { checkpoints, totalSamples } = submissionData;
    let passedCheckpoints = 0;
    let failedCheckpoints = 0;

    Object.values(checkpoints).forEach(checkpoint => {
      if (checkpoint.result === 'Accepted') {
        passedCheckpoints++;
      } else {
        failedCheckpoints++;
      }
    });

    const overallResult = failedCheckpoints === 0 ? 'Accept Lot' : 'Reject Lot';

    return {
      success: true,
      message: 'Inspection submitted successfully',
      inspectionId,
      irNumber: `2026/${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      submittedAt: new Date().toISOString(),
      result: {
        totalCheckpoints: Object.keys(checkpoints).length,
        passedCheckpoints,
        failedCheckpoints,
        passRate: ((passedCheckpoints / Object.keys(checkpoints).length) * 100).toFixed(1),
        overallResult,
      },
    };
  }

  const response = await apiFetch(ENDPOINTS.inspection.submitResult, {
    method: 'POST',
    body: JSON.stringify({
      inspection_queue_id: parseInt(inspectionId),
      stage_type: submissionData.stage_type || 'visual',
      total_checked: submissionData.totalSamples || 0,
      total_passed: submissionData.totalSamples || 0,
      total_failed: 0,
      stage_result: 'pass',
      remarks: submissionData.remarks || '',
      ...submissionData,
    }),
  });

  // Transform backend response to match the format SuccessModal expects
  const apiData = response.data || response;
  const totalCheckpoints = Object.keys(submissionData.checkpoints || {}).length || 1;
  let passedCheckpoints = 0;
  let failedCheckpoints = 0;

  Object.values(submissionData.checkpoints || {}).forEach(cp => {
    if (cp.result === 'Accepted') passedCheckpoints++;
    else if (cp.result === 'Rejected') failedCheckpoints++;
    else passedCheckpoints++; // default to passed
  });

  return {
    success: true,
    message: response.message || 'Inspection submitted successfully',
    inspectionId,
    irNumber: apiData.result_number || null,
    submittedAt: new Date().toISOString(),
    result: {
      totalCheckpoints,
      passedCheckpoints,
      failedCheckpoints,
      passRate: ((passedCheckpoints / totalCheckpoints) * 100).toFixed(1),
      overallResult: apiData.overall_result === 'accept' ? 'Accept Lot' : 'Reject Lot',
    },
  };
};


// ---------------------------------------------------------------------------
// API: Get saved readings
// ---------------------------------------------------------------------------
export const getSavedReadings = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay();
    return getMockSavedReadings(inspectionId);
  }

  return apiFetch(ENDPOINTS.inspection.readings(inspectionId));
};


// ---------------------------------------------------------------------------
// API: Get inspection form by part code
// ---------------------------------------------------------------------------
export const getInspectionFormByPartCode = async (partCode) => {
  if (USE_MOCK_API) {
    await mockDelay();
    const form = getInspectionForm(partCode);

    if (!form) {
      throw new Error(`Inspection form not found for part code: ${partCode}`);
    }

    return form;
  }

  // Try local form first, fall back to API
  const localForm = getInspectionForm(partCode);
  if (localForm) return localForm;

  return apiFetch(ENDPOINTS.inspection.getForm?.(partCode) || `/inspection/forms/${partCode}`);
};


// ---------------------------------------------------------------------------
// API: Generate inspection report
// ---------------------------------------------------------------------------
export const generateInspectionReport = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay(1000);
    return {
      success: true,
      irNumber: `2026/${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      pdfUrl: `/reports/ir-${inspectionId}.pdf`,
      generatedAt: new Date().toISOString(),
    };
  }

  return apiFetch(ENDPOINTS.inspectionReports.generate(inspectionId), {
    method: 'POST',
  });
};


// ---------------------------------------------------------------------------
// Client-side helpers (no API call)
// ---------------------------------------------------------------------------
export const validateReading = (value, checkpoint) => {
  if (checkpoint.type === 'visual') {
    const isValid = checkpoint.options?.includes(value);
    return {
      isValid,
      status: isValid ? 'pass' : 'fail',
      message: isValid ? 'OK' : 'Invalid selection',
    };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      status: 'error',
      message: 'Invalid numeric value',
    };
  }

  const { minValue, maxValue, nominalValue } = checkpoint;
  const isWithinTolerance = numValue >= minValue && numValue <= maxValue;

  return {
    isValid: isWithinTolerance,
    status: isWithinTolerance ? 'pass' : 'fail',
    message: isWithinTolerance
      ? 'Within tolerance'
      : `Out of tolerance (${minValue} - ${maxValue})`,
    deviation: nominalValue ? (numValue - nominalValue).toFixed(3) : null,
  };
};


export const calculateCheckpointResult = (readings, checkpoint) => {
  if (!readings || Object.keys(readings).length === 0) {
    return 'Pending';
  }

  const validReadings = Object.values(readings).filter(r => r.value !== null && r.value !== '');

  if (validReadings.length === 0) {
    return 'Pending';
  }

  const hasFailure = validReadings.some(r => r.status === 'fail');
  return hasFailure ? 'Rejected' : 'Accepted';
};

export default {
  getInspectionQueue,
  getInspectionById,
  startInspection,
  saveDraftReadings,
  submitInspection,
  getSavedReadings,
  getInspectionFormByPartCode,
  generateInspectionReport,
  validateReading,
  calculateCheckpointResult,
};
