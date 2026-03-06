// src/pages/admin/sampling-master/api/validation.js

const VALIDATION_RULES = {
  samplePlanNo: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[A-Za-z0-9\-_]+$/,
    patternMessage: 'Only letters, numbers, hyphens, and underscores allowed',
  },
  samplePlanType: {
    required: true,
    validValues: ['SP1', 'SP2', 'SP3'],
  },
  iterations: {
    required: true,
    min: 1,
    max: 3,
  },
  lotMin: {
    required: true,
    min: 1,
    max: 999999,
  },
  lotMax: {
    required: true,
    min: 1,
    max: 999999,
  },
  qcPlanNo: {
    required: true,
    minLength: 2,
    maxLength: 30,
    pattern: /^[A-Za-z0-9\-_.]+$/,
    patternMessage: 'Only letters, numbers, hyphens, underscores, and dots allowed',
  },
  productId:    { required: true },
  documentRevNo: { required: true, minLength: 1, maxLength: 20 },
  revisionDate:  { required: true },
  departmentId:  { required: true },
  company:       { required: true },
  location:      { required: true },
};


export const validateField = (fieldName, value, formData = {}) => {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return null;

  if (rules.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) return `Minimum ${rules.minLength} characters required`;
    if (rules.maxLength && value.length > rules.maxLength) return `Maximum ${rules.maxLength} characters allowed`;
    if (rules.pattern && !rules.pattern.test(value)) return rules.patternMessage || 'Invalid format';
  }
  if (typeof value === 'number' || rules.min !== undefined || rules.max !== undefined) {
    const n = Number(value);
    if (isNaN(n)) return 'Must be a valid number';
    if (rules.min !== undefined && n < rules.min) return `Minimum value is ${rules.min}`;
    if (rules.max !== undefined && n > rules.max) return `Maximum value is ${rules.max}`;
  }
  if (rules.validValues && !rules.validValues.includes(value)) return 'Please select a valid option';
  if (fieldName === 'lotMax' && formData.lotMin) {
    if (Number(value) < Number(formData.lotMin)) return 'Max must be greater than or equal to Min';
  }
  return null;
};


export const validateSamplingPlanForm = (formData) => {
  const errors = {};

  // Top-level fields only
  ['samplePlanNo', 'samplePlanType', 'iterations'].forEach(field => {
    const error = validateField(field, formData[field], formData);
    if (error) errors[field] = error;
  });

  // Lot ranges — only validate lotMin, lotMax, and iteration1 (sample size)
  if (formData.lotRanges && formData.lotRanges.length > 0) {
    const lotRangeErrors = [];
    let hasRangeErrors = false;

    formData.lotRanges.forEach((range) => {
      const rangeErrors = {};

      const lotMinError = validateField('lotMin', range.lotMin, formData);
      if (lotMinError) { rangeErrors.lotMin = lotMinError; hasRangeErrors = true; }

      const lotMaxError = validateField('lotMax', range.lotMax, { lotMin: range.lotMin });
      if (lotMaxError) { rangeErrors.lotMax = lotMaxError; hasRangeErrors = true; }

      // iteration1 must be >= 1 if filled in
      if (range.iteration1 !== '' && range.iteration1 !== undefined && range.iteration1 !== null) {
        const n = Number(range.iteration1);
        if (isNaN(n) || n < 1) {
          rangeErrors.iteration1 = 'Sample size must be >= 1';
          hasRangeErrors = true;
        }
      }

      lotRangeErrors.push(rangeErrors);
    });

    // Overlapping range check
    const sorted = [...formData.lotRanges].sort((a, b) => Number(a.lotMin) - Number(b.lotMin));
    for (let i = 1; i < sorted.length; i++) {
      if (Number(sorted[i].lotMin) <= Number(sorted[i - 1].lotMax)) {
        const origIdx = formData.lotRanges.indexOf(sorted[i]);
        if (origIdx >= 0) {
          lotRangeErrors[origIdx].lotMin = 'Overlaps with previous range';
          hasRangeErrors = true;
        }
      }
    }

    if (hasRangeErrors) errors.lotRanges = lotRangeErrors;
  } else {
    errors.lotRanges = 'At least one lot range is required';
  }

  return errors;
};


export const validateQualityPlanForm = (formData) => {
  const errors = {};
  ['qcPlanNo', 'productId', 'documentRevNo', 'revisionDate', 'departmentId', 'company', 'location'].forEach(field => {
    const error = validateField(field, formData[field], formData);
    if (error) errors[field] = error;
  });
  return errors;
};


export const hasErrors = (errors) => {
  if (!errors) return false;
  return Object.keys(errors).some(key => {
    const value = errors[key];
    if (Array.isArray(value)) return value.some(item => item && Object.keys(item).length > 0);
    return value !== null && value !== undefined && value !== '';
  });
};


// ---------------------------------------------------------------------------
// getInitialSamplingPlanState
// All Sample Size Configuration fields are BLANK — user fills them in manually.
// No defaults, no pre-calculated values.
// ---------------------------------------------------------------------------
export const getInitialSamplingPlanState = () => ({
  samplePlanNo:    '',
  samplePlanName:  '',
  samplePlanType:  'SP1',
  aqlLevel:        '1.0',
  inspectionLevel: 'II',
  iterations:      1,
  lotRanges: [
    {
      id:            Date.now(),
      lotMin:        '',
      lotMax:        '',
      iteration1:    '',
      passRequired1: '',
      iteration2:    '',
      passRequired2: '',
      iteration3:    '',
      passRequired3: '',
    },
  ],
});


export const getInitialQualityPlanState = () => ({
  qcPlanNo:        '',
  planName:        '',
  productId:       '',
  documentRevNo:   '',
  revisionDate:    new Date().toISOString().split('T')[0],
  effectiveDate:   '',
  departmentId:    '',
  company:         '',
  location:        '',
  description:     '',
  planType:        'standard',
  inspectionStages: 1,
  requiresVisual:   true,
  requiresFunctional: false,
  documentNumber:  '',
  status:          'draft',
  stages: [
    {
      _key:               `stage-init-${Date.now()}`,
      stageName:          '',
      stageType:          'visual',
      stageSequence:      1,
      inspectionType:     'sampling',
      samplingPlanId:     '',
      isMandatory:        true,
      requiresInstrument: false,
      parameters: [
        {
          _key:               `param-init-${Date.now()}`,
          parameterName:      '',
          parameterSequence:  1,
          checkingType:       'visual',
          specification:      '',
          nominalValue:       '',
          toleranceMin:       '',
          toleranceMax:       '',
          unitId:             '',
          instrumentId:       '',
          inputType:          'pass_fail',
          isMandatory:        true,
          acceptanceCriteria: '',
        },
      ],
    },
  ],
});


export const getInitialErrorState = () => ({});


export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export default {
  validateField,
  validateSamplingPlanForm,
  validateQualityPlanForm,
  hasErrors,
  getInitialSamplingPlanState,
  getInitialQualityPlanState,
  getInitialErrorState,
  debounce,
};
