export const COMPONENT_API_CONFIG = {
  useMockData: false,
  logApiCalls: true,
  baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
};


export const USE_MOCK_DATA = COMPONENT_API_CONFIG.useMockData;
export const API_BASE_URL = COMPONENT_API_CONFIG.baseUrl;


const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'X-User-Id':    user.id    || localStorage.getItem('userId')    || '1',
    'X-User-Name':  user.name  || localStorage.getItem('userName')  || 'Admin User',
    'X-User-Role':  user.role  || localStorage.getItem('userRole')  || 'admin',
    'X-User-Email': user.email || localStorage.getItem('userEmail') || 'admin@appasamy.com',
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'X-User-Id':    user.id    || localStorage.getItem('userId')    || '1',
    'X-User-Name':  user.name  || localStorage.getItem('userName')  || 'Admin User',
    'X-User-Role':  user.role  || localStorage.getItem('userRole')  || 'admin',
    'X-User-Email': user.email || localStorage.getItem('userEmail') || 'admin@appasamy.com',
  };
};

const ENDPOINTS = {

  components:           `${COMPONENT_API_CONFIG.baseUrl}/components`,
  componentById:        (id) => `${COMPONENT_API_CONFIG.baseUrl}/components/${id}`,
  duplicateComponent:   (id) => `${COMPONENT_API_CONFIG.baseUrl}/components/${id}/duplicate`,
  validatePartCode:     `${COMPONENT_API_CONFIG.baseUrl}/components/validate-part-code`,
  uploadDocument:       `${COMPONENT_API_CONFIG.baseUrl}/components/upload-document`,
  deleteDocument:       (docId) => `${COMPONENT_API_CONFIG.baseUrl}/components/documents/${docId}`,
  exportComponents:     `${COMPONENT_API_CONFIG.baseUrl}/components/export`,


  lookupCategories:     `${COMPONENT_API_CONFIG.baseUrl}/lookups/categories`,
  lookupGroups:         `${COMPONENT_API_CONFIG.baseUrl}/lookups/groups`,
  lookupUnits:          `${COMPONENT_API_CONFIG.baseUrl}/lookups/units`,
  lookupInstruments:    `${COMPONENT_API_CONFIG.baseUrl}/lookups/instruments`,
  lookupVendors:        `${COMPONENT_API_CONFIG.baseUrl}/lookups/vendors`,
  lookupSamplingPlans:  `${COMPONENT_API_CONFIG.baseUrl}/lookups/sampling-plans`,
  lookupQcPlans:        `${COMPONENT_API_CONFIG.baseUrl}/lookups/qc-plans`,
  lookupDepartments:    `${COMPONENT_API_CONFIG.baseUrl}/lookups/departments`,


  samplingPlans:        `${COMPONENT_API_CONFIG.baseUrl}/sampling-plans`,
};


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logApiCall = (method, url, data = null) => {
  if (COMPONENT_API_CONFIG.logApiCalls) {
    console.log(`[ComponentAPI ${COMPONENT_API_CONFIG.useMockData ? 'MOCK' : 'REAL'}] ${method} ${url}`, data || '');
  }
};

const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
};


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
      const details = typeof errorBody.errors === 'object'
        ? (Array.isArray(errorBody.errors)
            ? errorBody.errors.map(e => typeof e === 'object' ? `${e.field}: ${e.message}` : String(e)).join(', ')
            : Object.entries(errorBody.errors).map(([k, v]) => `${k}: ${v}`).join(', '))
        : String(errorBody.errors);
      message += ` — ${details}`;
    }
    console.error('[ComponentAPI Error]', response.status, url, errorBody);
    const error = new Error(message);
    error.status = response.status;
    error.details = errorBody;
    throw error;
  }

  return response.json();
};


const transformers = {


  categoryFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.category_code,
    name: apiData.category_name || apiData.name || '',
    icon: apiData.icon || '📦',
  }),


  groupFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.group_code,
    name: apiData.group_name || apiData.name || '',
  }),


  samplingPlanFromApi: (apiData) => ({
    id:       apiData.id,
    code:     apiData.plan_code,
    name:     apiData.plan_name || apiData.plan_code || '',
    aqlLevel: apiData.aql_level || '',
  }),


  qcPlanFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.plan_code,
    name: apiData.plan_name || apiData.plan_code || '',
  }),


  unitFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.unit_code,
    name: apiData.unit_name || apiData.unit_code || '',
  }),


  instrumentFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.instrument_code,
    name: apiData.instrument_name || apiData.instrument_code || '',
  }),


  vendorFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.vendor_code,
    name: apiData.vendor_name || apiData.vendor_code || '',
  }),


  departmentFromApi: (apiData) => ({
    id:   apiData.id,
    code: apiData.department_code,
    name: apiData.department_name || '',
  }),


  checkingParamFromApi: (p) => ({
    id:             p.id,
    checkingType:   p.checking_type || 'visual',
    checkingPoint:  p.checking_point || '',
    unit:           p.unit?.unit_code || p.unit_code || '',
    unitId:         p.unit_id || p.unit?.id || null,
    specification:  p.specification || '',
    instrumentName: p.instrument?.instrument_name || p.instrument_name || '',
    instrumentId:   p.instrument_id || p.instrument?.id || null,
    nominalValue:   p.nominal_value || '',
    toleranceMin:   p.tolerance_min || '',
    toleranceMax:   p.tolerance_max || '',
    inputType:      p.input_type || 'measurement',
    sortOrder:      p.sort_order || 0,
    isMandatory:    p.is_mandatory !== false,
  }),


  checkingParamToApi: (p, lookupCache = {}) => {

    let unitId = p.unitId || null;
    if (!unitId && p.unit && lookupCache.units) {
      const match = lookupCache.units.find(
        u => u.code?.toLowerCase() === p.unit?.toLowerCase() ||
             u.name?.toLowerCase() === p.unit?.toLowerCase()
      );
      if (match) unitId = match.id;
    }


    let instrumentId = p.instrumentId || null;
    if (!instrumentId && p.instrumentName && lookupCache.instruments) {
      const match = lookupCache.instruments.find(
        i => i.name?.toLowerCase() === p.instrumentName?.toLowerCase()
      );
      if (match) instrumentId = match.id;
    }

    return {
      checking_type:  p.checkingType || (p.toleranceMin || p.toleranceMax ? 'functional' : 'visual'),
      checking_point: p.checkingPoint,
      specification:  p.specification || null,
      nominal_value:  p.nominalValue ? Number(p.nominalValue) : null,
      tolerance_min:  p.toleranceMin ? Number(p.toleranceMin) : null,
      tolerance_max:  p.toleranceMax ? Number(p.toleranceMax) : null,
      unit_id:        unitId,
      instrument_id:  instrumentId,
      input_type:     p.inputType || (p.toleranceMin || p.toleranceMax ? 'numeric' : 'pass_fail'),
      sort_order:     p.sortOrder ?? 0,
      is_mandatory:   p.isMandatory !== false,
    };
  },


  componentListFromApi: (c) => ({
    id:                c.id,
    componentCode:     c.component_code,
    partCode:          c.part_code,
    partName:          c.part_name,
    partDescription:   c.part_description || '',
    productCategory:   c.category?.category_code || '',
    productCategoryId: c.category?.id || null,
    categoryName:      c.category?.category_name || '',
    productGroup:      c.group?.group_name || '',
    productGroupId:    c.group?.id || null,
    qcPlanNo:          c.qc_plan?.plan_code || '',
    qcPlanName:        c.qc_plan?.plan_name || '',
    qcPlanId:          c.qc_plan?.id || null,
    qcRequired:        c.qc_required !== false,
    inspectionType:    c.default_inspection_type || 'sampling',
    samplingPlan:      c.sampling_plan?.plan_code || '',
    samplingPlanId:    c.sampling_plan?.id || null,
    drawingNo:         c.drawing_no || '',
    testCertRequired:  c.test_cert_required || false,
    specRequired:      c.spec_required || false,
    fqirRequired:      c.fqir_required || false,
    cocRequired:       c.coc_required || false,
    prProcessCode:     c.pr_process_code || '',
    prProcessName:     c.pr_process_name || c.source_type_name || '',
    vendor:            c.primary_vendor?.vendor_name || '',
    vendorId:          c.primary_vendor?.id || null,
    department:        c.department?.department_name || '',
    departmentId:      c.department?.id || null,
    checkpoints:       c.checking_params_count || 0,
    specifications:    {},
    status:            c.status || 'draft',
    createdAt:         c.created_at,
    updatedAt:         c.updated_at,
    createdBy:         c.created_by,
    updatedBy:         c.updated_by,
    skipLotEnabled:    c.skip_lot_enabled || false,
    skipLotCount:      c.skip_lot_count || 0,
    skipLotThreshold:  c.skip_lot_threshold || 5,
  }),


  componentFullFromApi: (c) => {
    const base = transformers.componentListFromApi(c);


    const allParams = (c.checking_parameters || []).map(transformers.checkingParamFromApi);
    const visualParams    = allParams.filter(p => p.checkingType === 'visual');
    const functionalParams = allParams.filter(p => p.checkingType !== 'visual');


    let checkingType = 'visual';
    if (visualParams.length > 0 && functionalParams.length > 0) checkingType = 'both';
    else if (functionalParams.length > 0) checkingType = 'functional';

    return {
      ...base,
      checkingParameters: {
        type: checkingType,
        parameters: allParams,
      },
      visualParams,
      functionalParams,

      specificationsList: (c.specifications || []).map(s => ({
        id:        s.id,
        specKey:   s.spec_key,
        specValue: s.spec_value,
        sortOrder: s.sort_order,
      })),

      documents: (c.documents || []).map(d => ({
        id:           d.id,
        documentType: d.document_type,
        fileName:     d.file_name,
        filePath:     d.file_path,
        fileSize:     d.file_size,
        mimeType:     d.mime_type,
        uploadedAt:   d.uploaded_at || d.created_at,
      })),

      vendors: (c.approved_vendors || c.vendors || []).map(v => ({
        id:           v.id,
        vendorId:     v.vendor_id,
        vendorName:   v.vendor?.vendor_name || v.vendor_name || '',
        vendorCode:   v.vendor?.vendor_code || v.vendor_code || '',
        isPrimary:    v.is_primary || false,
        unitPrice:    v.unit_price,
        leadTimeDays: v.lead_time_days,
      })),
    };
  },


  componentToApi: (formData, lookupCache = {}) => {

    let categoryId = formData.productCategoryId || null;
    if (!categoryId && formData.productCategory != null && lookupCache.categories) {
      const val = formData.productCategory;

      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
        categoryId = Number(val);
      } else if (typeof val === 'string') {
        const match = lookupCache.categories.find(
          c => c.id === val ||
               c.code?.toLowerCase() === val.toLowerCase() ||
               c.name?.toLowerCase() === val.toLowerCase()
        );
        if (match) categoryId = typeof match.id === 'number' ? match.id : null;
      }
    }


    // Group ID resolution removed — Product Group field removed per feedback (Ref: 7.3.0 DB-02)


    let qcPlanId = formData.qcPlanId || null;
    if (!qcPlanId && formData.qcPlanNo != null && lookupCache.qcPlans) {
      const val = formData.qcPlanNo;
      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
        qcPlanId = Number(val);
      } else if (typeof val === 'string') {
        const match = lookupCache.qcPlans.find(
          p => p.id === val ||
               p.code?.toLowerCase() === val.toLowerCase()
        );
        if (match) qcPlanId = typeof match.id === 'number' ? match.id : null;
      }
    }


    let samplingPlanId = formData.samplingPlanId || null;
    if (!samplingPlanId && formData.samplingPlan != null && lookupCache.samplingPlans) {
      const val = formData.samplingPlan;
      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
        samplingPlanId = Number(val);
      } else if (typeof val === 'string') {
        const match = lookupCache.samplingPlans.find(
          p => p.id === val ||
               p.code?.toLowerCase() === val.toLowerCase()
        );
        if (match) samplingPlanId = typeof match.id === 'number' ? match.id : null;
      }
    }


    let departmentId = formData.departmentId || null;


    const allParams = [];
    const checkingData = formData.checkingParameters;
    if (checkingData && checkingData.parameters) {
      checkingData.parameters.forEach((p, idx) => {
        if (p.checkingPoint && p.checkingPoint.trim()) {
          allParams.push(transformers.checkingParamToApi({ ...p, sortOrder: idx + 1 }, lookupCache));
        }
      });
    }

    const payload = {
      part_code:                formData.partCode,
      part_name:                formData.partName,
      part_description:         formData.partDescription || null,
      category_id:              categoryId,
      // product_group_id removed per feedback (Ref: 7.3.0 DB-02)
      qc_required:              true,
      qc_plan_id:               qcPlanId,
      default_inspection_type:  formData.inspectionType === '100%' ? '100_percent' : 'sampling',
      default_sampling_plan_id: formData.inspectionType === '100%' ? null : samplingPlanId,
      test_cert_required:       formData.testCertRequired || false,
      spec_required:            formData.specRequired || false,
      fqir_required:            formData.fqirRequired || false,
      coc_required:             formData.cocRequired || false,
      pr_process_code:          formData.prProcessCode || null,
      pr_process_name:          formData.prProcessName || null,
      drawing_no:               formData.drawingNo || null,
      department_id:            departmentId,
      skip_lot_enabled:         formData.skipLotEnabled || false,
      skip_lot_count:           formData.skipLotCount || 0,
      skip_lot_threshold:       formData.skipLotThreshold || 5,
      status:                   formData.status || 'draft',
      checking_parameters:      allParams,
    };

    return payload;
  },
};


let _lookupCache = {
  categories: null,
  groups: {},
  samplingPlans: null,
  qcPlans: null,
  units: null,
  instruments: null,
  vendors: null,
  departments: null,
};


const getCachedLookup = async (key, fetchFn) => {
  if (_lookupCache[key]) return _lookupCache[key];
  const data = await fetchFn();
  _lookupCache[key] = data;
  return data;
};


export const clearLookupCache = () => {
  _lookupCache = {
    categories: null, groups: {}, samplingPlans: null,
    qcPlans: null, units: null, instruments: null,
    vendors: null, departments: null,
  };
};


const getLookupCache = () => _lookupCache;


export const getProductCategories = async () => {
  logApiCall('GET', ENDPOINTS.lookupCategories);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(300);
    return [
      { id: 'mechanical',  name: 'Mechanical',  icon: '⚙️' },
      { id: 'electrical',  name: 'Electrical',  icon: '⚡' },
      { id: 'plastic',     name: 'Plastic',     icon: '🧪' },
      { id: 'electronics', name: 'Electronics', icon: '🔌' },
      { id: 'optical',     name: 'Optical',     icon: '🔍' },
    ];
  }

  const result = await apiFetch(ENDPOINTS.lookupCategories);
  const categories = (result.data || result || []).map(transformers.categoryFromApi);
  _lookupCache.categories = categories;
  return categories;
};


export const getProductGroups = async (category) => {
  logApiCall('GET', `${ENDPOINTS.lookupGroups}?category_id=${category}`);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    const mockGroups = {
      mechanical:  ['Housings', 'Frames', 'Casings', 'Brackets', 'Enclosures'],
      electrical:  ['Cables', 'Connectors', 'Switches', 'Transformers', 'Motors'],
      plastic:     ['Covers', 'Panels', 'Lenses', 'Buttons', 'Gaskets'],
      electronics: ['PCB Assembly', 'Display Modules', 'Sensors', 'Controllers', 'Power Units'],
      optical:     ['Lenses', 'Mirrors', 'Filters', 'Prisms', 'Light Guides'],
    };
    return mockGroups[category] || [];
  }


  let categoryId = category;
  if (typeof category === 'string' && isNaN(Number(category))) {
    const categories = await getCachedLookup('categories', getProductCategories);
    const match = categories.find(
      c => c.code?.toLowerCase() === category.toLowerCase() ||
           c.name?.toLowerCase() === category.toLowerCase()
    );
    categoryId = match?.id || category;
  }

  const result = await apiFetch(`${ENDPOINTS.lookupGroups}?category_id=${categoryId}`);
  const groups = (result.data || result || []).map(transformers.groupFromApi);
  _lookupCache.groups[categoryId] = groups;
  return groups;
};


export const getSamplingPlans = async () => {
  logApiCall('GET', ENDPOINTS.lookupSamplingPlans);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(300);
    return [
      { id: 'SP-001', name: 'Critical Components - Level I', aqlLevel: 'Level I' },
      { id: 'SP-002', name: 'Electrical Assembly - Level II', aqlLevel: 'Level II' },
      { id: 'SP-003', name: 'Visual Inspection - Standard', aqlLevel: 'Level III' },
      { id: 'SP-004', name: 'High-Precision Parts', aqlLevel: 'Special S-3' },
      { id: 'SP-005', name: 'General Inspection', aqlLevel: 'Level I' },
    ];
  }

  const result = await apiFetch(ENDPOINTS.lookupSamplingPlans);
  const plans = (result.data || result || []).map(transformers.samplingPlanFromApi);
  _lookupCache.samplingPlans = plans;
  return plans;
};


export const getQCPlans = async () => {
  logApiCall('GET', ENDPOINTS.lookupQcPlans);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(300);
    return [
      { id: 'RD.7.3-01', name: 'B-SCAN Probe QC Plan' },
      { id: 'RD.7.3-02', name: 'Display Module QC Plan' },
      { id: 'RD.7.3-03', name: 'Cable Assembly QC Plan' },
      { id: 'RD.7.3-04', name: 'Enclosure QC Plan' },
      { id: 'RD.7.3-05', name: 'Power Supply QC Plan' },
      { id: 'RD.7.3-06', name: 'PCB Assembly QC Plan' },
      { id: 'RD.7.3-07', name: 'Optical Components QC Plan' },
    ];
  }

  const result = await apiFetch(ENDPOINTS.lookupQcPlans);
  const plans = (result.data || result || []).map(transformers.qcPlanFromApi);
  _lookupCache.qcPlans = plans;
  return plans;
};


export const getUnits = async () => {
  logApiCall('GET', ENDPOINTS.lookupUnits);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    return [
      { id: 1, code: 'mm', name: 'mm' },
      { id: 2, code: 'cm', name: 'cm' },
      { id: 3, code: 'inch', name: 'inch' },
      { id: 4, code: 'kg', name: 'kg' },
      { id: 5, code: 'g', name: 'g' },
      { id: 6, code: 'nos', name: 'Nos' },
      { id: 7, code: 'pcs', name: 'Pcs' },
    ];
  }

  const result = await apiFetch(ENDPOINTS.lookupUnits);
  const units = (result.data || result || []).map(transformers.unitFromApi);
  _lookupCache.units = units;
  return units;
};


export const getInstruments = async () => {
  logApiCall('GET', ENDPOINTS.lookupInstruments);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    return [
      { id: 1, code: 'VC', name: 'Vernier Caliper' },
      { id: 2, code: 'DM', name: 'Digital Micrometer' },
      { id: 3, code: 'DS', name: 'Digital Scale' },
    ];
  }

  const result = await apiFetch(ENDPOINTS.lookupInstruments);
  const instruments = (result.data || result || []).map(transformers.instrumentFromApi);
  _lookupCache.instruments = instruments;
  return instruments;
};


export const getVendors = async () => {
  logApiCall('GET', ENDPOINTS.lookupVendors);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    return [];
  }

  const result = await apiFetch(ENDPOINTS.lookupVendors);
  const vendors = (result.data || result || []).map(transformers.vendorFromApi);
  _lookupCache.vendors = vendors;
  return vendors;
};


export const getDepartments = async () => {
  logApiCall('GET', ENDPOINTS.lookupDepartments);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    return [];
  }

  const result = await apiFetch(ENDPOINTS.lookupDepartments);
  const departments = (result.data || result || []).map(transformers.departmentFromApi);
  _lookupCache.departments = departments;
  return departments;
};


export const fetchComponents = async (params = {}) => {
  const { page = 1, limit = 12, search, category, status } = params;
  logApiCall('GET', ENDPOINTS.components, params);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(400);

    return { items: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }


  let categoryId = undefined;
  if (category && category !== 'all') {
    if (typeof category === 'number' || (typeof category === 'string' && !isNaN(Number(category)) && category.trim() !== '')) {
      categoryId = Number(category);
    } else if (typeof category === 'string') {
      const categories = await getCachedLookup('categories', getProductCategories);
      const match = categories.find(
        c => c.code?.toLowerCase() === category.toLowerCase() ||
             c.name?.toLowerCase() === category.toLowerCase()
      );
      categoryId = match?.id;
    }
  }

  const queryParams = {
    page,
    per_page: limit,
    search:      search || undefined,
    category_id: categoryId || undefined,
    status:      status || undefined,
    sort_by:     'updated_at',
    sort_order:  'desc',
  };

  const qs = buildQueryString(queryParams);
  const result = await apiFetch(`${ENDPOINTS.components}${qs}`);


  const items = (result.data || []).map(transformers.componentListFromApi);
  const meta = result.pagination || result.meta || {};

  return {
    items,
    pagination: {
      page:       meta.page || page,
      limit:      meta.per_page || limit,
      total:      meta.total || items.length,
      totalPages: meta.pages || meta.total_pages || Math.ceil((meta.total || items.length) / limit),
    },
  };
};


export const getComponents = async (filters = {}) => {
  const result = await fetchComponents({
    page: filters.page || 1,
    limit: filters.pageSize || filters.limit || 20,
    search: filters.search,
    category: filters.category,
    status: filters.status,
  });

  return {
    data:     result.items,
    total:    result.pagination.total,
    page:     result.pagination.page,
    pageSize: result.pagination.limit,
  };
};


export const getComponentById = async (id) => {
  logApiCall('GET', ENDPOINTS.componentById(id));

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(300);
    throw new Error('Mock mode — component detail not available');
  }

  const result = await apiFetch(ENDPOINTS.componentById(id));
  return transformers.componentFullFromApi(result.data || result);
};


export const createComponent = async (formData) => {

  await Promise.all([
    getCachedLookup('categories', getProductCategories),
    getCachedLookup('samplingPlans', getSamplingPlans),
    getCachedLookup('qcPlans', getQCPlans),
    getCachedLookup('units', getUnits),
    getCachedLookup('instruments', getInstruments),
  ]);

  if (formData.productCategory) {
    const catVal = formData.productCategory;
    let categoryId;
    if (typeof catVal === 'number' || (typeof catVal === 'string' && !isNaN(Number(catVal)) && catVal !== '')) {
      categoryId = Number(catVal);
    } else {
      categoryId = _lookupCache.categories?.find(
        c => c.code?.toLowerCase() === String(catVal).toLowerCase() ||
             c.id === catVal
      )?.id;
    }
    if (categoryId && !_lookupCache.groups[categoryId]) {
      await getProductGroups(categoryId);
    }

    _lookupCache._allGroups = Object.values(_lookupCache.groups).flat();
  }

  const payload = transformers.componentToApi(formData, {
    ...getLookupCache(),
    groups: _lookupCache._allGroups || Object.values(_lookupCache.groups).flat(),
  });

  logApiCall('POST', ENDPOINTS.components, payload);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(500);
    return { id: Date.now(), ...formData, status: 'draft' };
  }

  const result = await apiFetch(ENDPOINTS.components, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const updateComponent = async (id, formData) => {

  await Promise.all([
    getCachedLookup('categories', getProductCategories),
    getCachedLookup('samplingPlans', getSamplingPlans),
    getCachedLookup('qcPlans', getQCPlans),
    getCachedLookup('units', getUnits),
    getCachedLookup('instruments', getInstruments),
  ]);
  if (formData.productCategory) {
    const catVal = formData.productCategory;
    let categoryId;
    if (typeof catVal === 'number' || (typeof catVal === 'string' && !isNaN(Number(catVal)) && catVal !== '')) {
      categoryId = Number(catVal);
    } else {
      categoryId = _lookupCache.categories?.find(
        c => c.code?.toLowerCase() === String(catVal).toLowerCase() ||
             c.id === catVal
      )?.id;
    }
    if (categoryId && !_lookupCache.groups[categoryId]) {
      await getProductGroups(categoryId);
    }
    _lookupCache._allGroups = Object.values(_lookupCache.groups).flat();
  }

  const payload = transformers.componentToApi(formData, {
    ...getLookupCache(),
    groups: _lookupCache._allGroups || Object.values(_lookupCache.groups).flat(),
  });

  logApiCall('PUT', ENDPOINTS.componentById(id), payload);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(500);
    return { id, ...formData };
  }

  const result = await apiFetch(ENDPOINTS.componentById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const deleteComponent = async (id) => {
  logApiCall('DELETE', ENDPOINTS.componentById(id));

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(400);
    return { success: true };
  }

  const result = await apiFetch(ENDPOINTS.componentById(id), {
    method: 'DELETE',
  });

  return { success: true, ...result };
};


export const duplicateComponent = async (id) => {
  logApiCall('POST', ENDPOINTS.duplicateComponent(id));

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(500);
    return { id: Date.now(), partCode: 'COPY', partName: 'Copy', status: 'draft' };
  }

  const result = await apiFetch(ENDPOINTS.duplicateComponent(id), {
    method: 'POST',
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const validatePartCode = async (partCode, excludeId = null) => {
  logApiCall('GET', `${ENDPOINTS.validatePartCode}?part_code=${partCode}`);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(200);
    return { isUnique: true };
  }

  try {
    const qs = buildQueryString({ part_code: partCode });
    const result = await apiFetch(`${ENDPOINTS.validatePartCode}${qs}`);

    const data = result.data || result;
    return { isUnique: data.available !== false };
  } catch (error) {
    console.error('Part code validation error:', error);
    return { isUnique: true };
  }
};


export const uploadAttachment = async (file, componentId, fieldName) => {
  logApiCall('POST', ENDPOINTS.uploadDocument, { componentId, fieldName, fileName: file.name });

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(800);
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: URL.createObjectURL(file),
    };
  }


  const docTypeMap = {
    drawingAttachment:   'drawing',
    testCertFile:        'test_cert',
    specFile:            'specification',
    fqirFile:            'fqir',
    cocFile:             'coc',
    visualSpecSheet:     'visual_spec_sheet',
    functionalSpecSheet: 'functional_spec_sheet',
  };

  const formData = new FormData();
  formData.append('file', file);
  formData.append('component_id', String(componentId));
  formData.append('document_type', docTypeMap[fieldName] || fieldName || 'other');

  const response = await fetch(ENDPOINTS.uploadDocument, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Failed to upload file');
  }

  const result = await response.json();
  const doc = result.data || result;

  return {
    success: true,
    id:       doc.id,
    fileName: doc.file_name || file.name,
    fileSize: doc.file_size || file.size,
    fileType: doc.mime_type || file.type,
    url:      doc.file_path || doc.url || '',
  };
};


export const deleteDocument = async (docId) => {
  logApiCall('DELETE', ENDPOINTS.deleteDocument(docId));

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(400);
    return { success: true };
  }

  const result = await apiFetch(ENDPOINTS.deleteDocument(docId), {
    method: 'DELETE',
  });

  return { success: true, ...result };
};


export const exportComponents = async (params = {}) => {
  logApiCall('POST', ENDPOINTS.exportComponents, params);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(800);
    return { success: true, count: 0 };
  }


  let categoryId = null;
  if (params.category) {
    const catVal = params.category;
    if (typeof catVal === 'number' || (typeof catVal === 'string' && !isNaN(Number(catVal)) && catVal.trim() !== '')) {
      categoryId = Number(catVal);
    } else if (typeof catVal === 'string') {
      const categories = await getCachedLookup('categories', getProductCategories);
      const match = categories.find(
        c => c.code?.toLowerCase() === catVal.toLowerCase() ||
             c.name?.toLowerCase() === catVal.toLowerCase()
      );
      categoryId = match?.id || null;
    }
  }

  const response = await fetch(ENDPOINTS.exportComponents, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      category_id: categoryId,
      status: params.status || null,
      ids: params.ids || null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export components');
  }


  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `components_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);

  return { success: true };
};


export const importComponents = async (file) => {
  logApiCall('POST', `${ENDPOINTS.components}/import`, { fileName: file.name });

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(1000);
    return { success: true, imported: 0 };
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ENDPOINTS.components}/import`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Failed to import components');
  }

  return response.json();
};


export const createSamplingPlanInline = async (planData) => {
  logApiCall('POST', ENDPOINTS.samplingPlans, planData);

  if (COMPONENT_API_CONFIG.useMockData) {
    await delay(500);
    return { id: Date.now(), code: planData.plan_code, name: planData.plan_name };
  }

  const result = await apiFetch(ENDPOINTS.samplingPlans, {
    method: 'POST',
    body: JSON.stringify(planData),
  });


  _lookupCache.samplingPlans = null;

  const plan = result.data || result;
  return transformers.samplingPlanFromApi(plan);
};


export const API_CONFIG = {
  USE_MOCK_DATA: COMPONENT_API_CONFIG.useMockData,
  API_BASE_URL:  COMPONENT_API_CONFIG.baseUrl,
};


export default {
  COMPONENT_API_CONFIG,

  getProductCategories,
  getProductGroups,
  getSamplingPlans,
  getQCPlans,
  getUnits,
  getInstruments,
  getVendors,
  getDepartments,

  fetchComponents,
  getComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  duplicateComponent,

  validatePartCode,
  uploadAttachment,
  deleteDocument,
  exportComponents,
  importComponents,
  createSamplingPlanInline,

  clearLookupCache,
};
