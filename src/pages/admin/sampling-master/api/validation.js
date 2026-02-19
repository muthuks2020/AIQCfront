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
  company: {
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  productId: {
    required: true,
  },
  documentRevNo: {
    required: true,
    minLength: 1,
    maxLength: 20,
  },
  revisionDate: {
    required: true,
  },
  departmentId: {
    required: true,
  },
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
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }
  }


  if (typeof value === 'number' || rules.min !== undefined || rules.max !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }
    if (rules.min !== undefined && numValue < rules.min) {
      return `Minimum value is ${rules.min}`;
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return `Maximum value is ${rules.max}`;
    }
  }


  if (rules.validValues && !rules.validValues.includes(value)) {
    return 'Please select a valid option';
  }


  if (fieldName === 'lotMax' && formData.lotMin) {
    if (Number(value) < Number(formData.lotMin)) {
      return 'Max must be greater than or equal to Min';
    }
  }

  return null;
};


export const validateSamplingPlanForm = (formData) => {
  const errors = {};


  const basicFields = ['samplePlanNo', 'samplePlanType', 'iterations'];
  basicFields.forEach(field => {
    const error = validateField(field, formData[field], formData);
    if (error) errors[field] = error;
  });


  if (formData.lotRanges && formData.lotRanges.length > 0) {
    const lotRangeErrors = [];
    let hasRangeErrors = false;

    formData.lotRanges.forEach((range, index) => {
      const rangeErrors = {};


      if (!range.lotMin || range.lotMin < 1) {
        rangeErrors.lotMin = 'Lot Min is required';
        hasRangeErrors = true;
      }


      if (!range.lotMax || range.lotMax < 1) {
        rangeErrors.lotMax = 'Lot Max is required';
        hasRangeErrors = true;
      } else if (range.lotMin && Number(range.lotMax) < Number(range.lotMin)) {
        rangeErrors.lotMax = 'Max must be >= Min';
        hasRangeErrors = true;
      }


      if (range.iteration1 !== undefined && range.iteration1 !== '' && range.iteration1 !== null) {
        if (Number(range.iteration1) < 1) {
          rangeErrors.iteration1 = 'Sample size must be at least 1';
          hasRangeErrors = true;
        }
        if (range.lotMax && Number(range.iteration1) > Number(range.lotMax)) {
          rangeErrors.iteration1 = 'Cannot exceed lot max';
          hasRangeErrors = true;
        }
      }


      if (range.passRequired1 !== undefined && range.iteration1 !== undefined) {
        if (Number(range.passRequired1) > Number(range.iteration1)) {
          rangeErrors.passRequired1 = 'Cannot exceed sample qty';
          hasRangeErrors = true;
        }
      }


      if (range.acceptNumber !== undefined && range.rejectNumber !== undefined) {
        if (Number(range.acceptNumber) < 0) {
          rangeErrors.acceptNumber = 'Accept number must be >= 0';
          hasRangeErrors = true;
        }
        if (Number(range.rejectNumber) < 1) {
          rangeErrors.rejectNumber = 'Reject number must be >= 1';
          hasRangeErrors = true;
        }
        if (Number(range.acceptNumber) >= Number(range.rejectNumber)) {
          rangeErrors.rejectNumber = 'Reject must be > Accept';
          hasRangeErrors = true;
        }
      }

      lotRangeErrors.push(rangeErrors);
    });


    const sortedRanges = [...formData.lotRanges].sort((a, b) => Number(a.lotMin) - Number(b.lotMin));
    for (let i = 1; i < sortedRanges.length; i++) {
      if (Number(sortedRanges[i].lotMin) <= Number(sortedRanges[i - 1].lotMax)) {
        const origIdx = formData.lotRanges.indexOf(sortedRanges[i]);
        if (origIdx >= 0) {
          lotRangeErrors[origIdx].lotMin = 'Overlaps with previous range';
          hasRangeErrors = true;
        }
      }
    }

    if (hasRangeErrors) {
      errors.lotRanges = lotRangeErrors;
    }
  } else {
    errors.lotRanges = 'At least one lot range is required';
  }

  return errors;
};


export const validateQualityPlanForm = (formData) => {
  const errors = {};

  const fields = ['qcPlanNo', 'company', 'location', 'productId', 'documentRevNo', 'revisionDate', 'departmentId'];
  fields.forEach(field => {
    const error = validateField(field, formData[field], formData);
    if (error) errors[field] = error;
  });

  return errors;
};


export const hasErrors = (errors) => {
  if (!errors) return false;
  return Object.keys(errors).some(key => {
    const value = errors[key];
    if (Array.isArray(value)) {
      return value.some(item => item && Object.keys(item).length > 0);
    }
    return value !== null && value !== undefined && value !== '';
  });
};


export const getInitialSamplingPlanState = () => ({
  samplePlanNo: '',
  samplePlanName: '',
  samplePlanType: 'SP1',
  aqlLevel: '1.0',
  inspectionLevel: 'II',
  iterations: 1,
  lotRanges: [
    {
      id: Date.now(),
      lotMin: 2,
      lotMax: 50,
      iteration1: 8,
      iteration2: 16,
      iteration3: 50,
      passRequired1: 7,
      passRequired2: 15,
      passRequired3: 48,
      acceptNumber: 0,
      rejectNumber: 1,
    },
  ],
});


export const getInitialQualityPlanState = () => ({
  qcPlanNo: '',
  planName: '',
  company: '',
  location: '',
  productId: '',
  documentRevNo: '',
  revisionDate: new Date().toISOString().split('T')[0],
  effectiveDate: '',
  departmentId: '',
  description: '',
  planType: 'standard',
  inspectionStages: 1,
  requiresVisual: true,
  requiresFunctional: false,
  documentNumber: '',
  status: 'draft',
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
