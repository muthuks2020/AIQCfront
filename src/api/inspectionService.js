import { USE_MOCK_API, API_CONFIG, ENDPOINTS, getHeaders } from './config';
import {
  getMockInspectionQueue,
  getMockBatchDetails,
  getMockSavedReadings
} from './mockData';
import { getInspectionForm } from '../data/inspection-forms';


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

  return apiFetch(ENDPOINTS.inspection.byId(inspectionId));
};


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
    method: 'PUT',
    body: JSON.stringify(readingsData),
  });
};


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

  return apiFetch(ENDPOINTS.inspection.submit(inspectionId), {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
};


export const getSavedReadings = async (inspectionId) => {
  if (USE_MOCK_API) {
    await mockDelay();
    return getMockSavedReadings(inspectionId);
  }

  return apiFetch(ENDPOINTS.inspection.readings(inspectionId));
};


export const getInspectionFormByPartCode = async (partCode) => {
  if (USE_MOCK_API) {
    await mockDelay();
    const form = getInspectionForm(partCode);

    if (!form) {
      throw new Error(`Inspection form not found for part code: ${partCode}`);
    }

    return form;
  }

  return apiFetch(ENDPOINTS.inspection.getForm(partCode));
};


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
