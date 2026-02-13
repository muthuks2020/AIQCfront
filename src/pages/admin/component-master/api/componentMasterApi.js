// =============================================================================
// Component Master API — Real API Integration
// =============================================================================
// All config, headers, fetch, and utilities imported from the single source
// of truth: src/api/config.js
// =============================================================================

import {
  USE_MOCK_DATA,
  API_CONFIG,
  COMPONENT_ENDPOINTS as ENDPOINTS,
  getAuthHeaders,
  getMultipartHeaders,
  apiFetch,
  buildQueryString,
  logApiCall,
} from '../../../../api/config';


// =============================================================================
// Transformers
// =============================================================================
const transformers = {

  // --- Lookup transformers ---
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

  // --- Checking param transformers ---
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
    // Resolve unit ID
    let unitId = p.unitId || null;
    if (!unitId && p.unit && lookupCache.units) {
      const match = lookupCache.units.find(
        u => u.code?.toLowerCase() === p.unit?.toLowerCase() ||
             u.name?.toLowerCase() === p.unit?.toLowerCase()
      );
      if (match) unitId = match.id;
    }

    // Resolve instrument ID
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

  // --- Component list item from API ---
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
    prProcessName:     c.pr_process_name || '',
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

  // --- Full component detail from API ---
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

  // --- Form data → API payload ---
  // FIX: Removed 'status' field from payload — backend hardcodes status='active' on creation
  componentToApi: (formData, lookupCache = {}) => {
    // Resolve category ID
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

    // Resolve group ID
    let groupId = formData.productGroupId || null;
    if (!groupId && formData.productGroup != null && lookupCache.groups) {
      const val = formData.productGroup;
      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
        groupId = Number(val);
      } else if (typeof val === 'string') {
        const match = lookupCache.groups.find(
          g => g.id === val ||
               g.name?.toLowerCase() === val.toLowerCase()
        );
        if (match) groupId = typeof match.id === 'number' ? match.id : null;
      }
    }

    // Resolve QC plan ID
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

    // Resolve sampling plan ID
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

    // Department ID
    let departmentId = formData.departmentId || null;

    // Build checking parameters
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
      product_group_id:         groupId,
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
      // FIX: 'status' removed — backend sets status='active' automatically on create
      checking_parameters:      allParams,
    };

    return payload;
  },
};


// =============================================================================
// Lookup cache
// =============================================================================
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


// =============================================================================
// Lookup API calls
// =============================================================================
export const getProductCategories = async () => {
  logApiCall('GET', ENDPOINTS.lookupCategories);

  const result = await apiFetch(ENDPOINTS.lookupCategories);
  const categories = (result.data || result || []).map(transformers.categoryFromApi);
  _lookupCache.categories = categories;
  return categories;
};


export const getProductGroups = async (category) => {
  logApiCall('GET', `${ENDPOINTS.lookupGroups}?category_id=${category}`);

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

  const result = await apiFetch(ENDPOINTS.lookupSamplingPlans);
  const plans = (result.data || result || []).map(transformers.samplingPlanFromApi);
  _lookupCache.samplingPlans = plans;
  return plans;
};


export const getQCPlans = async () => {
  logApiCall('GET', ENDPOINTS.lookupQcPlans);

  const result = await apiFetch(ENDPOINTS.lookupQcPlans);
  const plans = (result.data || result || []).map(transformers.qcPlanFromApi);
  _lookupCache.qcPlans = plans;
  return plans;
};


export const getUnits = async () => {
  logApiCall('GET', ENDPOINTS.lookupUnits);

  const result = await apiFetch(ENDPOINTS.lookupUnits);
  const units = (result.data || result || []).map(transformers.unitFromApi);
  _lookupCache.units = units;
  return units;
};


export const getInstruments = async () => {
  logApiCall('GET', ENDPOINTS.lookupInstruments);

  const result = await apiFetch(ENDPOINTS.lookupInstruments);
  const instruments = (result.data || result || []).map(transformers.instrumentFromApi);
  _lookupCache.instruments = instruments;
  return instruments;
};


export const getVendors = async () => {
  logApiCall('GET', ENDPOINTS.lookupVendors);

  const result = await apiFetch(ENDPOINTS.lookupVendors);
  const vendors = (result.data || result || []).map(transformers.vendorFromApi);
  _lookupCache.vendors = vendors;
  return vendors;
};


export const getDepartments = async () => {
  logApiCall('GET', ENDPOINTS.lookupDepartments);

  const result = await apiFetch(ENDPOINTS.lookupDepartments);
  const departments = (result.data || result || []).map(transformers.departmentFromApi);
  _lookupCache.departments = departments;
  return departments;
};


// =============================================================================
// Component CRUD
// =============================================================================
export const fetchComponents = async (params = {}) => {
  const { page = 1, limit = 12, search, category, status } = params;
  logApiCall('GET', ENDPOINTS.components, params);

  // Resolve category ID
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

  const result = await apiFetch(ENDPOINTS.componentById(id));
  return transformers.componentFullFromApi(result.data || result);
};


export const createComponent = async (formData) => {
  // Pre-fetch all lookups needed for ID resolution
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

  const result = await apiFetch(ENDPOINTS.components, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const updateComponent = async (id, formData) => {
  // Pre-fetch all lookups needed for ID resolution
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

  const result = await apiFetch(ENDPOINTS.componentById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const deleteComponent = async (id) => {
  logApiCall('DELETE', ENDPOINTS.componentById(id));

  const result = await apiFetch(ENDPOINTS.componentById(id), {
    method: 'DELETE',
  });

  return { success: true, ...result };
};


export const duplicateComponent = async (id) => {
  logApiCall('POST', ENDPOINTS.duplicateComponent(id));

  const result = await apiFetch(ENDPOINTS.duplicateComponent(id), {
    method: 'POST',
  });

  return transformers.componentFullFromApi(result.data || result);
};


export const validatePartCode = async (partCode, excludeId = null) => {
  logApiCall('GET', `${ENDPOINTS.validatePartCode}?part_code=${partCode}`);

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


// =============================================================================
// File operations
// =============================================================================
export const uploadAttachment = async (file, componentId, fieldName) => {
  logApiCall('POST', ENDPOINTS.uploadDocument, { componentId, fieldName, fileName: file.name });

  const docTypeMap = {
    drawingAttachment: 'drawing',
    testCertFile:      'test_cert',
    specFile:          'specification',
    fqirFile:          'fqir',
    cocFile:           'coc',
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

  const result = await apiFetch(ENDPOINTS.deleteDocument(docId), {
    method: 'DELETE',
  });

  return { success: true, ...result };
};


export const exportComponents = async (params = {}) => {
  logApiCall('POST', ENDPOINTS.exportComponents, params);

  // Resolve category ID for export
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

  const result = await apiFetch(ENDPOINTS.samplingPlans, {
    method: 'POST',
    body: JSON.stringify(planData),
  });

  // Invalidate cache so new plan appears in dropdowns
  _lookupCache.samplingPlans = null;

  const plan = result.data || result;
  return transformers.samplingPlanFromApi(plan);
};


export default {
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
