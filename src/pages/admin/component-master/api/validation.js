export const VALIDATION_RULES = {
  productCategory: {
    required: true,
    message: 'Please select a product category',
  },
  productGroup: {
    required: true,
    message: 'Please select a product group',
  },
  partCode: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[A-Z0-9\-_]+$/i,
    messages: {
      required: 'Part code is required',
      minLength: 'Part code must be at least 3 characters',
      maxLength: 'Part code cannot exceed 50 characters',
      pattern: 'Part code can only contain letters, numbers, hyphens, and underscores',
      unique: 'This part code already exists',
    },
  },
  partName: {
    required: true,
    minLength: 3,
    maxLength: 200,
    messages: {
      required: 'Part name is required',
      minLength: 'Part name must be at least 3 characters',
      maxLength: 'Part name cannot exceed 200 characters',
    },
  },
  qcPlanNo: {
    required: true,
    message: 'Please select a QC Plan',
  },
  inspectionType: {
    required: true,
    message: 'Please select an inspection type',
  },
  samplingPlan: {
    requiredIf: (formData) => formData.inspectionType === 'sampling',
    message: 'Sampling plan is required for sampling inspection type',
  },
  drawingNo: {
    required: false,
    maxLength: 50,
    pattern: /^[A-Z0-9\-_\.]+$/i,
    messages: {
      maxLength: 'Drawing number cannot exceed 50 characters',
      pattern: 'Drawing number contains invalid characters',
    },
  },
  prProcessCode: {
    required: true,
    message: 'Please select a PR Process',
  },
};


export const validateField = (name, value, formData = {}) => {
  const rules = VALIDATION_RULES[name];
  if (!rules) return null;


  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rules.message || rules.messages?.required || `${name} is required`;
  }


  if (rules.requiredIf && rules.requiredIf(formData) && !value) {
    return rules.message;
  }


  if (!value) return null;


  if (rules.minLength && value.length < rules.minLength) {
    return rules.messages?.minLength || `Must be at least ${rules.minLength} characters`;
  }


  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.messages?.maxLength || `Cannot exceed ${rules.maxLength} characters`;
  }


  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.messages?.pattern || 'Invalid format';
  }

  return null;
};


export const validateForm = (formData) => {
  const errors = {};
  let isValid = true;


  Object.keys(VALIDATION_RULES).forEach((fieldName) => {
    const error = validateField(fieldName, formData[fieldName], formData);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};


export const validatePartCodeUnique = async (partCode, validateFn, excludeId = null) => {
  if (!partCode || partCode.length < 3) return null;

  try {
    const result = await validateFn(partCode, excludeId);
    if (!result.isUnique) {
      return VALIDATION_RULES.partCode.messages.unique;
    }
    return null;
  } catch (error) {
    console.error('Error validating part code:', error);
    return null;
  }
};


export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5,
    allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
  } = options;

  if (!file) return null;


  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSize) {
    return `File size must be less than ${maxSize}MB`;
  }


  if (!allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return `Only ${types} files are allowed`;
  }

  return null;
};


export const getInitialFormState = () => ({
  productCategory: '',
  productGroup: '',
  partCode: '',
  partName: '',
  qcPlanNo: '',
  inspectionType: 'sampling',
  samplingPlan: '',
  drawingNo: '',
  drawingAttachment: null,
  testCertFile: null,
  specFile: null,
  fqirFile: null,
  testCertRequired: false,
  specRequired: false,
  fqirRequired: false,
  prProcessCode: 'direct_purchase',
});

export const getInitialErrorState = () => ({
  productCategory: null,
  productGroup: null,
  partCode: null,
  partName: null,
  qcPlanNo: null,
  inspectionType: null,
  samplingPlan: null,
  drawingNo: null,
  drawingAttachment: null,
  testCertFile: null,
  specFile: null,
  fqirFile: null,
  prProcessCode: null,
});


export const formatErrorsForDisplay = (errors) => {
  return Object.entries(errors)
    .filter(([_, error]) => error)
    .map(([field, error]) => ({
      field,
      message: error,
    }));
};

export const hasErrors = (errors) => {
  return Object.values(errors).some(error => error !== null);
};

export const clearFieldError = (errors, fieldName) => ({
  ...errors,
  [fieldName]: null,
});

export const setFieldError = (errors, fieldName, message) => ({
  ...errors,
  [fieldName]: message,
});


export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};


export const isFormDirty = (formData, initialData) => {
  return Object.keys(formData).some(key => {
    const current = formData[key];
    const initial = initialData[key];


    if (current instanceof File) {
      return current !== initial;
    }


    return current !== initial;
  });
};

export default {
  VALIDATION_RULES,
  validateField,
  validateForm,
  validatePartCodeUnique,
  validateFile,
  getInitialFormState,
  getInitialErrorState,
  formatErrorsForDisplay,
  hasErrors,
  clearFieldError,
  setFieldError,
  debounce,
  isFormDirty,
};
