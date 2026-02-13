

export const SAMPLING_API_CONFIG = {
  useMockData: false,
  logApiCalls: true,
  baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
};


const getAuthHeaders = () => {

  const savedAuth = localStorage.getItem('appasamy_qc_auth');
  let user = {};
  let token = null;

  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);
      user = parsed.user || {};
    } catch (e) {
      console.warn('[API] Failed to parse auth from localStorage');
    }
  }


  token = localStorage.getItem('authToken');

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'X-User-Id': String(user.id || user.userId || localStorage.getItem('userId') || '1'),
    'X-User-Name': user.name || user.user_name || localStorage.getItem('userName') || 'Admin User',
    'X-User-Role': user.role || localStorage.getItem('userRole') || 'admin',
    'X-User-Email': user.email || localStorage.getItem('userEmail') || 'admin@appasamy.com',
  };
};


const ENDPOINTS = {

  samplingPlans:        `${SAMPLING_API_CONFIG.baseUrl}/sampling-plans`,
  samplingPlanById:     (id) => `${SAMPLING_API_CONFIG.baseUrl}/sampling-plans/${id}`,
  calculateSample:      (id) => `${SAMPLING_API_CONFIG.baseUrl}/sampling-plans/${id}/calculate-sample`,


  qcPlans:              `${SAMPLING_API_CONFIG.baseUrl}/qc-plans`,
  qcPlanById:           (id) => `${SAMPLING_API_CONFIG.baseUrl}/qc-plans/${id}`,


  departments:          `${SAMPLING_API_CONFIG.baseUrl}/departments`,


  categories:           `${SAMPLING_API_CONFIG.baseUrl}/categories`,


  lookupSamplingPlans:  `${SAMPLING_API_CONFIG.baseUrl}/lookups/sampling-plans`,
  lookupQcPlans:        `${SAMPLING_API_CONFIG.baseUrl}/lookups/qc-plans`,
};


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logApiCall = (method, url, data = null) => {
  if (SAMPLING_API_CONFIG.logApiCalls) {
    console.log(`[API ${SAMPLING_API_CONFIG.useMockData ? 'MOCK' : 'REAL'}] ${method} ${url}`, data || '');
  }
};

const generateId = (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;


// =============================================================================
// FIX #1: apiFetch error handler — properly handles array errors
// =============================================================================
const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    let message = errorBody.message || errorBody.error || `API Error: ${response.status} ${response.statusText}`;

    if (errorBody.errors) {
      let details;
      if (Array.isArray(errorBody.errors)) {
        // Marshmallow nested list validation returns an array of error objects
        details = errorBody.errors
          .map((e, i) => {
            if (typeof e === 'object' && e !== null) {
              return Object.entries(e).map(([k, v]) => `Row ${i}: ${k}: ${v}`).join(', ');
            }
            return String(e);
          })
          .filter(Boolean)
          .join('; ');
      } else if (typeof errorBody.errors === 'object') {
        details = Object.entries(errorBody.errors)
          .map(([k, v]) => {
            if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
            return `${k}: ${v}`;
          })
          .join(', ');
      } else {
        details = String(errorBody.errors);
      }
      message += ` — ${details}`;
    }
    if (errorBody.details) {
      message += ` — ${JSON.stringify(errorBody.details)}`;
    }
    console.error('[API Error]', response.status, url, errorBody);
    const error = new Error(message);
    error.status = response.status;
    error.details = errorBody;
    throw error;
  }

  return response.json();
};


// =============================================================================
// getPlanTypeName — MUST be defined before transformers (no hoisting for const)
// =============================================================================
const getPlanTypeName = (type) => {
  const map = {
    SP1: 'Level 1 - Normal',
    SP2: 'Level 2 - Reduced',
    SP3: 'Level 3 - 100% Inspection',
    SP0: 'Skip Lot',
  };
  return map[type] || 'Level 1 - Normal';
};


// =============================================================================
// Normalize legacy plan_type values from DB to standard SP codes
// Old records may have 'aql_based', 'fixed', 'custom', 'normal', 'tightened', 'reduced'
// =============================================================================
const normalizePlanType = (rawType) => {
  if (!rawType) return 'SP1';
  const upper = rawType.toUpperCase();
  // Already a valid SP code
  if (['SP0', 'SP1', 'SP2', 'SP3'].includes(upper)) return upper;
  // Map legacy values
  const legacyMap = {
    'AQL_BASED': 'SP1',
    'NORMAL':    'SP1',
    'FIXED':     'SP0',
    'TIGHTENED': 'SP2',
    'REDUCED':   'SP2',
    'CUSTOM':    'SP1',
  };
  return legacyMap[upper] || 'SP1';
};

const transformers = {


  // =============================================================================
  // FIX #4: samplingPlanFromApi — read iterations, normalize plan_type
  // =============================================================================
  samplingPlanFromApi: (apiData) => {
    const planType = normalizePlanType(apiData.plan_type);
    return {
    id:                 apiData.id,
    samplePlanNo:       apiData.plan_code,
    samplePlanName:     apiData.plan_name || '',
    samplePlanType:     planType,
    samplePlanTypeName: getPlanTypeName(planType),
    aqlLevel:           apiData.aql_level || '',
    inspectionLevel:    apiData.inspection_level || '',
    iterations:         apiData.iterations || 1,
    status:             apiData.is_active !== false ? 'active' : 'inactive',
    createdAt:          apiData.created_at,
    updatedAt:          apiData.updated_at,

    lotRanges: (apiData.details || []).map((d, idx) => ({
      id:             d.id || idx,
      lotMin:         d.lot_size_min,
      lotMax:         d.lot_size_max,
      iteration1:     d.sample_size,
      iteration2:     d.sample_size * 2,
      iteration3:     d.lot_size_max,
      passRequired1:  d.sample_size - d.reject_number,
      passRequired2:  (d.sample_size * 2) - d.reject_number,
      passRequired3:  d.lot_size_max - d.reject_number,
      acceptNumber:   d.accept_number,
      rejectNumber:   d.reject_number,
    })),
  };},


  // =============================================================================
  // FIX #2 & #3: samplingPlanToApi — correct plan_type mapping + iterations + safe numbers
  // =============================================================================
  samplingPlanToApi: (formData) => {

    // FIX #3: Send the actual plan type code (sp1, sp2, sp3) as the DB expects,
    // NOT 'aql_based' for everything.
    const planTypeMap = {
      SP1: 'sp1',
      SP2: 'sp2',
      SP3: 'sp3',
      SP0: 'sp0',
    };

    return {
      plan_code:        formData.samplePlanNo,
      plan_name:        formData.samplePlanName || formData.samplePlanNo,
      plan_type:        planTypeMap[formData.samplePlanType] || formData.samplePlanType?.toLowerCase() || 'sp1',
      aql_level:        formData.aqlLevel || '1.0',
      inspection_level: formData.inspectionLevel || 'II',
      iterations:       Number(formData.iterations) || 1,   // FIX #4: send iterations to backend
      details: (formData.lotRanges || []).map(range => {
        const sampleSize = Number(range.iteration1) || 1;

        // FIX #2: Safe accept_number / reject_number computation
        let rejectNumber = Number(range.rejectNumber);
        if (isNaN(rejectNumber) || rejectNumber < 1) {
          const passReq = Number(range.passRequired1);
          if (!isNaN(passReq) && passReq > 0 && passReq < sampleSize) {
            rejectNumber = sampleSize - passReq;
          } else {
            rejectNumber = 1;
          }
        }

        let acceptNumber = Number(range.acceptNumber);
        if (isNaN(acceptNumber) || acceptNumber < 0) {
          acceptNumber = Math.max(0, sampleSize - rejectNumber);
        }

        // Ensure reject_number > accept_number (backend schema constraint)
        if (rejectNumber <= acceptNumber) {
          rejectNumber = acceptNumber + 1;
        }

        return {
          lot_size_min:   Number(range.lotMin),
          lot_size_max:   Number(range.lotMax),
          sample_size:    sampleSize,
          accept_number:  acceptNumber,
          reject_number:  rejectNumber,
        };
      }),
    };
  },


  qualityPlanFromApi: (apiData) => ({
    id:              apiData.id,
    qcPlanNo:        apiData.plan_code,
    planName:        apiData.plan_name || '',
    documentRevNo:   apiData.revision || '',
    revisionDate:    apiData.revision_date || '',
    effectiveDate:   apiData.effective_date || '',
    planType:        apiData.plan_type || 'standard',
    inspectionStages: apiData.inspection_stages || 1,
    requiresVisual:  apiData.requires_visual ?? true,
    requiresFunctional: apiData.requires_functional ?? false,
    documentNumber:  apiData.document_number || '',
    productId:       apiData.product_id || '',
    departmentId:    apiData.department_id || '',
    description:     apiData.description || '',
    status:          apiData.status || 'draft',
    isActive:        apiData.is_active !== false,
    createdAt:       apiData.created_at,
    updatedAt:       apiData.updated_at,
    stages:          (apiData.stages || []).map(s => ({
      id:             s.id,
      stageCode:      s.stage_code,
      stageName:      s.stage_name,
      stageType:      s.stage_type,
      stageSequence:  s.stage_sequence,
      inspectionType: s.inspection_type,
      samplingPlanId: s.sampling_plan_id,
      isMandatory:    s.is_mandatory,
      parameters:     (s.parameters || []).map(p => ({
        id:               p.id,
        parameterName:    p.parameter_name,
        parameterSequence: p.parameter_sequence,
        checkingType:     p.checking_type,
        specification:    p.specification,
        nominalValue:     p.nominal_value,
        toleranceMin:     p.tolerance_min,
        toleranceMax:     p.tolerance_max,
        unitId:           p.unit_id,
        instrumentId:     p.instrument_id,
        inputType:        p.input_type,
        isMandatory:      p.is_mandatory,
        acceptanceCriteria: p.acceptance_criteria,
      })),
    })),
  }),


  qualityPlanToApi: (formData) => ({
    plan_code:          formData.qcPlanNo,
    plan_name:          formData.planName || formData.qcPlanNo,
    revision:           formData.documentRevNo,
    revision_date:      formData.revisionDate || null,
    effective_date:     formData.effectiveDate || null,
    plan_type:          formData.planType || 'standard',
    inspection_stages:  Number(formData.inspectionStages) || 1,
    requires_visual:    formData.requiresVisual ?? true,
    requires_functional: formData.requiresFunctional ?? false,
    document_number:    formData.documentNumber || null,
    status:             formData.status || 'draft',

    ...(formData.stages && {
      stages: formData.stages.map(s => ({
        stage_name:       s.stageName,
        stage_sequence:   s.stageSequence,
        stage_type:       s.stageType,
        is_mandatory:     s.isMandatory ?? true,
        sampling_plan_id: s.samplingPlanId || null,
        parameters: (s.parameters || []).map(p => ({
          parameter_name:     p.parameterName,
          parameter_sequence: p.parameterSequence,
          checking_type:      p.checkingType,
          specification:      p.specification,
          nominal_value:      p.nominalValue || null,
          tolerance_min:      p.toleranceMin || null,
          tolerance_max:      p.toleranceMax || null,
          unit_id:            p.unitId || null,
          instrument_id:      p.instrumentId || null,
          input_type:         p.inputType || 'pass_fail',
          is_mandatory:       p.isMandatory ?? true,
          acceptance_criteria: p.acceptanceCriteria || null,
        })),
      })),
    }),
  }),


  departmentFromApi: (d) => ({
    id:       d.id,
    code:     d.department_code,
    name:     d.department_name,
    head:     d.department_head || '',
    location: d.location || '',
    isActive: d.is_active !== false,
  }),


  productFromApi: (p) => ({
    id:       p.id,
    code:     p.category_code,
    name:     p.category_name,
    description: p.description || '',
    isActive: p.is_active !== false,
  }),
};


const AQL_TABLES = {
  SP1: { name: 'Level 1 - Normal', multiplier: 1.0 },
  SP2: { name: 'Level 2 - Reduced', multiplier: 1.5 },
  SP3: { name: 'Level 3 - 100% Inspection', multiplier: 'full' },
};

const LOT_SIZE_RANGES = [
  { id: 1, min: 2, max: 8, letter: 'A', sampleSizes: { SP1: 2, SP2: 2, SP3: 8 } },
  { id: 2, min: 9, max: 15, letter: 'B', sampleSizes: { SP1: 3, SP2: 3, SP3: 15 } },
  { id: 3, min: 16, max: 25, letter: 'C', sampleSizes: { SP1: 5, SP2: 5, SP3: 25 } },
  { id: 4, min: 26, max: 50, letter: 'D', sampleSizes: { SP1: 8, SP2: 8, SP3: 50 } },
  { id: 5, min: 51, max: 90, letter: 'E', sampleSizes: { SP1: 13, SP2: 13, SP3: 90 } },
  { id: 6, min: 91, max: 150, letter: 'F', sampleSizes: { SP1: 20, SP2: 20, SP3: 150 } },
  { id: 7, min: 151, max: 280, letter: 'G', sampleSizes: { SP1: 32, SP2: 32, SP3: 280 } },
  { id: 8, min: 281, max: 500, letter: 'H', sampleSizes: { SP1: 50, SP2: 50, SP3: 500 } },
  { id: 9, min: 501, max: 1200, letter: 'J', sampleSizes: { SP1: 80, SP2: 80, SP3: 1200 } },
  { id: 10, min: 1201, max: 3200, letter: 'K', sampleSizes: { SP1: 125, SP2: 125, SP3: 3200 } },
  { id: 11, min: 3201, max: 10000, letter: 'L', sampleSizes: { SP1: 200, SP2: 200, SP3: 10000 } },
  { id: 12, min: 10001, max: 35000, letter: 'M', sampleSizes: { SP1: 315, SP2: 315, SP3: 35000 } },
];


let mockSamplingPlans = [
  {
    id: 'SP-001', samplePlanNo: 'SP-001', samplePlanType: 'SP1',
    samplePlanTypeName: 'Level 1 - Normal', samplePlanName: 'Normal Inspection',
    iterations: 1, status: 'active', createdAt: '2026-01-15T10:00:00Z',
    lotRanges: [
      { id: 1, lotMin: 2, lotMax: 50, iteration1: 8, iteration2: 16, iteration3: 50, passRequired1: 7, passRequired2: 14, passRequired3: 48 },
      { id: 2, lotMin: 51, lotMax: 150, iteration1: 13, iteration2: 26, iteration3: 150, passRequired1: 12, passRequired2: 24, passRequired3: 145 },
      { id: 3, lotMin: 151, lotMax: 500, iteration1: 32, iteration2: 64, iteration3: 500, passRequired1: 30, passRequired2: 62, passRequired3: 490 },
    ],
  },
  {
    id: 'SP-002', samplePlanNo: 'SP-002', samplePlanType: 'SP2',
    samplePlanTypeName: 'Level 2 - Reduced', samplePlanName: 'Reduced Inspection',
    iterations: 1, status: 'active', createdAt: '2026-01-16T10:00:00Z',
    lotRanges: [
      { id: 1, lotMin: 2, lotMax: 50, iteration1: 5, iteration2: 10, iteration3: 50, passRequired1: 4, passRequired2: 9, passRequired3: 48 },
      { id: 2, lotMin: 51, lotMax: 150, iteration1: 8, iteration2: 16, iteration3: 150, passRequired1: 7, passRequired2: 14, passRequired3: 145 },
    ],
  },
  {
    id: 'SP-003', samplePlanNo: 'SP-003', samplePlanType: 'SP3',
    samplePlanTypeName: 'Level 3 - 100% Inspection', samplePlanName: '100% Inspection',
    iterations: 1, status: 'active', createdAt: '2026-01-17T10:00:00Z',
    lotRanges: [
      { id: 1, lotMin: 2, lotMax: 500, iteration1: 500, iteration2: 500, iteration3: 500, passRequired1: 498, passRequired2: 498, passRequired3: 498 },
    ],
  },
];

let mockQualityPlans = [
  {
    id: 'QP-001', qcPlanNo: 'RD.7.3-07', planName: 'B-SCAN Probe QC Plan',
    productId: '1', departmentId: '1', documentRevNo: 'Rev-03',
    revisionDate: '2026-01-15', description: 'QC plan for B-SCAN probe assembly',
    status: 'active', createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'QP-002', qcPlanNo: 'RD.7.3-08', planName: 'Display Module QC Plan',
    productId: '2', departmentId: '2', documentRevNo: 'Rev-01',
    revisionDate: '2026-01-20', description: 'QC plan for display modules',
    status: 'draft', createdAt: '2026-01-12T10:00:00Z',
  },
];

const mockDepartments = [
  { id: '1', code: 'QC', name: 'Quality Control', head: 'Rajesh Kumar', location: 'Chennai - Main' },
  { id: '2', code: 'PROD', name: 'Production', head: 'Arun Prakash', location: 'Chennai - Unit 2' },
  { id: '3', code: 'R&D', name: 'Research & Development', head: 'Dr. Meera S', location: 'Puducherry' },
  { id: '4', code: 'STORE', name: 'Store / Warehouse', head: 'Karthik V', location: 'Chennai - Main' },
  { id: '5', code: 'MAINT', name: 'Maintenance', head: 'Suresh M', location: 'Chennai - Unit 2' },
];

const mockProducts = [
  { id: '1', code: 'PRD-BSC', name: 'B-SCAN Probe', description: 'Ultrasound B-SCAN probe' },
  { id: '2', code: 'PRD-DSP', name: 'Display Module', description: 'LCD Display Module' },
  { id: '3', code: 'PRD-CAB', name: 'Cable Assembly', description: 'Medical cable assemblies' },
  { id: '4', code: 'PRD-IOL', name: 'IOL Lens', description: 'Intraocular lens' },
  { id: '5', code: 'PRD-ENC', name: 'Enclosure', description: 'Device enclosures' },
];


export const calculateSampleQuantity = (lotSize, planType = 'SP1') => {
  if (planType === 'SP3') return lotSize;

  const range = LOT_SIZE_RANGES.find(r => lotSize >= r.min && lotSize <= r.max);
  if (!range) {
    return lotSize > 35000 ? 500 : 2;
  }
  return range.sampleSizes[planType] || range.sampleSizes.SP1;
};

export const calculateRequiredPass = (sampleQty, iteration = 1) => {
  if (!sampleQty || sampleQty <= 0) return 0;
  const allowedDefectRate = iteration <= 1 ? 0.02 : 0.05;
  return Math.ceil(sampleQty * (1 - allowedDefectRate));
};


export const fetchSamplingPlans = async (filters = {}) => {
  logApiCall('GET', ENDPOINTS.samplingPlans, filters);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(400);
    let filtered = [...mockSamplingPlans];
    if (filters.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.samplePlanNo.toLowerCase().includes(s) ||
        (p.samplePlanTypeName || '').toLowerCase().includes(s)
      );
    }
    return { success: true, data: filtered, total: filtered.length };
  }


  const params = new URLSearchParams();

  if (filters.status !== 'all') params.append('is_active', 'true');
  if (filters.search) params.append('search', filters.search);
  if (filters.planType) params.append('plan_type', filters.planType);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const result = await apiFetch(`${ENDPOINTS.samplingPlans}${qs}`);

  return {
    success: true,
    data: (result.data || []).map(transformers.samplingPlanFromApi),
    total: result.total || result.data?.length || 0,
  };
};


export const fetchSamplingPlanById = async (id) => {
  logApiCall('GET', ENDPOINTS.samplingPlanById(id));

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(300);
    const plan = mockSamplingPlans.find(p => p.id === id || p.id === String(id));
    if (!plan) throw new Error('Sampling plan not found');
    return { success: true, data: plan };
  }

  const result = await apiFetch(ENDPOINTS.samplingPlanById(id));
  return {
    success: true,
    data: transformers.samplingPlanFromApi(result.data || result),
  };
};


export const createSamplingPlan = async (formData) => {
  const payload = SAMPLING_API_CONFIG.useMockData ? formData : transformers.samplingPlanToApi(formData);
  logApiCall('POST', ENDPOINTS.samplingPlans, payload);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(500);
    const newPlan = {
      ...formData,
      id: generateId('SP'),
      samplePlanTypeName: AQL_TABLES[formData.samplePlanType]?.name || 'Unknown',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockSamplingPlans.push(newPlan);
    return { success: true, data: newPlan };
  }

  const result = await apiFetch(ENDPOINTS.samplingPlans, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    success: true,
    data: transformers.samplingPlanFromApi(result.data || result),
  };
};


export const updateSamplingPlan = async (id, formData) => {
  const payload = SAMPLING_API_CONFIG.useMockData ? formData : transformers.samplingPlanToApi(formData);
  logApiCall('PUT', ENDPOINTS.samplingPlanById(id), payload);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(500);
    const idx = mockSamplingPlans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Sampling plan not found');
    mockSamplingPlans[idx] = {
      ...mockSamplingPlans[idx],
      ...formData,
      samplePlanTypeName: AQL_TABLES[formData.samplePlanType]?.name || mockSamplingPlans[idx].samplePlanTypeName,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: mockSamplingPlans[idx] };
  }

  const result = await apiFetch(ENDPOINTS.samplingPlanById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return {
    success: true,
    data: transformers.samplingPlanFromApi(result.data || result),
  };
};


export const deleteSamplingPlan = async (id) => {
  logApiCall('DELETE', ENDPOINTS.samplingPlanById(id));

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(400);
    mockSamplingPlans = mockSamplingPlans.filter(p => p.id !== id);
    return { success: true };
  }

  await apiFetch(ENDPOINTS.samplingPlanById(id), { method: 'DELETE' });
  return { success: true };
};


export const validateSamplingPlanNo = async (planNo, excludeId = null) => {
  logApiCall('GET', 'validate-sampling-plan-no', { planNo, excludeId });

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(200);
    const exists = mockSamplingPlans.some(
      p => p.samplePlanNo.toLowerCase() === planNo.toLowerCase() && p.id !== excludeId
    );
    return { isUnique: !exists };
  }


  try {
    const result = await apiFetch(`${ENDPOINTS.samplingPlans}?search=${encodeURIComponent(planNo)}`);
    const matches = (result.data || []).filter(p => {
      const code = (p.plan_code || '').toLowerCase();
      return code === planNo.toLowerCase() && (excludeId ? p.id !== Number(excludeId) : true);
    });
    return { isUnique: matches.length === 0 };
  } catch {
    return { isUnique: true };
  }
};


export const calculateSampleFromApi = async (planId, lotSize) => {
  logApiCall('GET', ENDPOINTS.calculateSample(planId), { lotSize });

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(200);
    return {
      success: true,
      data: {
        lot_size: lotSize,
        sample_size: calculateSampleQuantity(lotSize),
        accept_number: calculateRequiredPass(calculateSampleQuantity(lotSize), 1),
        reject_number: 1,
      },
    };
  }

  return apiFetch(`${ENDPOINTS.calculateSample(planId)}?lot_size=${lotSize}`);
};


export const fetchQualityPlans = async (filters = {}) => {
  logApiCall('GET', ENDPOINTS.qcPlans, filters);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(400);
    let filtered = [...mockQualityPlans];
    if (filters.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.qcPlanNo.toLowerCase().includes(s) ||
        (p.planName || '').toLowerCase().includes(s)
      );
    }
    return { success: true, data: filtered, total: filtered.length };
  }

  const params = new URLSearchParams();

  if (filters.status !== 'all') params.append('is_active', 'true');
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.perPage) params.append('per_page', filters.perPage);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const result = await apiFetch(`${ENDPOINTS.qcPlans}${qs}`);

  return {
    success: true,
    data: (result.data || []).map(transformers.qualityPlanFromApi),
    total: result.total || result.data?.length || 0,
  };
};


export const fetchQualityPlanById = async (id) => {
  logApiCall('GET', ENDPOINTS.qcPlanById(id));

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(300);
    const plan = mockQualityPlans.find(p => p.id === id || p.id === String(id));
    if (!plan) throw new Error('Quality plan not found');
    return { success: true, data: plan };
  }

  const result = await apiFetch(ENDPOINTS.qcPlanById(id));
  return {
    success: true,
    data: transformers.qualityPlanFromApi(result.data || result),
  };
};


export const createQualityPlan = async (formData) => {
  const payload = SAMPLING_API_CONFIG.useMockData ? formData : transformers.qualityPlanToApi(formData);
  logApiCall('POST', ENDPOINTS.qcPlans, payload);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(500);
    const newPlan = {
      ...formData,
      id: generateId('QP'),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    mockQualityPlans.push(newPlan);
    return { success: true, data: newPlan };
  }

  const result = await apiFetch(ENDPOINTS.qcPlans, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    success: true,
    data: transformers.qualityPlanFromApi(result.data || result),
  };
};


export const updateQualityPlan = async (id, formData) => {
  const payload = SAMPLING_API_CONFIG.useMockData ? formData : transformers.qualityPlanToApi(formData);
  logApiCall('PUT', ENDPOINTS.qcPlanById(id), payload);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(500);
    const idx = mockQualityPlans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Quality plan not found');
    mockQualityPlans[idx] = { ...mockQualityPlans[idx], ...formData, updatedAt: new Date().toISOString() };
    return { success: true, data: mockQualityPlans[idx] };
  }

  const result = await apiFetch(ENDPOINTS.qcPlanById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return {
    success: true,
    data: transformers.qualityPlanFromApi(result.data || result),
  };
};


export const deleteQualityPlan = async (id) => {
  logApiCall('DELETE', ENDPOINTS.qcPlanById(id));

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(400);
    mockQualityPlans = mockQualityPlans.filter(p => p.id !== id);
    return { success: true };
  }

  await apiFetch(ENDPOINTS.qcPlanById(id), { method: 'DELETE' });
  return { success: true };
};


export const validateQCPlanNo = async (planNo, excludeId = null) => {
  logApiCall('GET', 'validate-qc-plan-no', { planNo, excludeId });

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(200);
    const exists = mockQualityPlans.some(
      p => p.qcPlanNo.toLowerCase() === planNo.toLowerCase() && p.id !== excludeId
    );
    return { isUnique: !exists };
  }

  try {
    const result = await apiFetch(`${ENDPOINTS.qcPlans}?search=${encodeURIComponent(planNo)}`);
    const matches = (result.data || []).filter(p => {
      const code = (p.plan_code || '').toLowerCase();
      return code === planNo.toLowerCase() && (excludeId ? p.id !== Number(excludeId) : true);
    });
    return { isUnique: matches.length === 0 };
  } catch {

    return { isUnique: true };
  }
};


export const fetchDepartments = async () => {
  logApiCall('GET', ENDPOINTS.departments);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(300);
    return { success: true, data: mockDepartments };
  }

  const result = await apiFetch(`${ENDPOINTS.departments}?is_active=true`);
  return {
    success: true,
    data: (result.data || []).map(transformers.departmentFromApi),
  };
};


export const fetchProducts = async () => {
  logApiCall('GET', ENDPOINTS.categories);

  if (SAMPLING_API_CONFIG.useMockData) {
    await delay(300);
    return { success: true, data: mockProducts };
  }

  const result = await apiFetch(`${ENDPOINTS.categories}?is_active=true`);
  return {
    success: true,
    data: (result.data || []).map(transformers.productFromApi),
  };
};


export const getLotSizeRanges = () => LOT_SIZE_RANGES;
export const getAQLTables = () => AQL_TABLES;


export default {
  SAMPLING_API_CONFIG,

  fetchSamplingPlans,
  fetchSamplingPlanById,
  createSamplingPlan,
  updateSamplingPlan,
  deleteSamplingPlan,
  validateSamplingPlanNo,
  calculateSampleFromApi,

  fetchQualityPlans,
  fetchQualityPlanById,
  createQualityPlan,
  updateQualityPlan,
  deleteQualityPlan,
  validateQCPlanNo,

  fetchDepartments,
  fetchProducts,

  getLotSizeRanges,
  getAQLTables,
  calculateSampleQuantity,
  calculateRequiredPass,
};
