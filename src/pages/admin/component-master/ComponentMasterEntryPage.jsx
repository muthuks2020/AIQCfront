import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package,
  Layers,
  FileText,
  Settings,
  Save,
  X,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clipboard,
  Shield,
  Cog,
  Zap,
  Eye,
  FlaskConical,
  Lightbulb,
  HelpCircle,
  Plus,
  Trash2,
  Ruler,
  Wrench,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';


import { Header, Card } from '../../../components/common';
import {
  FormInput,
  FormSelect,
  FormToggle,
  FormCheckboxCard,
  FormFileUpload,
  CategorySelector,
  FormSection,
  FormButton,
  SuccessModal,
} from './components/FormComponents';


import {
  getProductCategories,
  getProductGroups,
  getSamplingPlans,
  getQCPlans,
  createComponent,
  updateComponent,
  getComponentById,
  uploadAttachment,
  deleteDocument,
  validatePartCode as apiValidatePartCode,
} from './api/componentMasterApi';

import {
  validateField,
  validateForm,
  validatePartCodeUnique,
  getInitialFormState,
  getInitialErrorState,
  debounce,
  hasErrors,
  clearFieldError,
  setFieldError,
} from './api/validation';


import './styles/ComponentMasterEntry.css';


import { colors } from '../../../constants/theme';

const ComponentMasterEntryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);


  const [formData, setFormData] = useState(getInitialFormState());
  const [errors, setErrors] = useState(getInitialErrorState());
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partCodeChecking, setPartCodeChecking] = useState(false);
  const [partCodeValid, setPartCodeValid] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState([]);


  const [visualEnabled, setVisualEnabled] = useState(false);
  const [functionalEnabled, setFunctionalEnabled] = useState(false);
  const [visualParams, setVisualParams] = useState([
    { id: 1, checkingPoint: '', unit: '', specification: '', instrumentName: '' }
  ]);
  const [functionalParams, setFunctionalParams] = useState([
    { id: 1, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }
  ]);
  const [visualCollapsed, setVisualCollapsed] = useState(false);
  const [functionalCollapsed, setFunctionalCollapsed] = useState(false);
  const [showParamSummary, setShowParamSummary] = useState(false);


  const [categories, setCategories] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [samplingPlans, setSamplingPlans] = useState([]);
  const [qcPlans, setQCPlans] = useState([]);


  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSamplingPlans, setLoadingSamplingPlans] = useState(true);
  const [loadingQCPlans, setLoadingQCPlans] = useState(true);


  useEffect(() => {
    const loadMasterData = async () => {
      try {

        setLoadingCategories(true);
        const categoriesData = await getProductCategories();
        setCategories(categoriesData);
        setLoadingCategories(false);


        setLoadingSamplingPlans(true);
        const samplingData = await getSamplingPlans();
        setSamplingPlans(samplingData);
        setLoadingSamplingPlans(false);


        setLoadingQCPlans(true);
        const qcData = await getQCPlans();
        setQCPlans(qcData);
        setLoadingQCPlans(false);
      } catch (error) {
        console.error('Error loading master data:', error);
      }
    };

    loadMasterData();
  }, []);


  // =========================================================================
  // Load existing component when editing
  // =========================================================================
  useEffect(() => {
    if (isEditing && id) {
      loadComponent();
    }
  }, [id]);

  const loadComponent = async () => {
    setIsLoading(true);
    try {
      const comp = await getComponentById(id);

      // Populate form fields from component data
      setFormData(prev => ({
        ...prev,
        partCode: comp.partCode || '',
        partName: comp.partName || '',
        partDescription: comp.partDescription || '',
        productCategory: comp.productCategoryId || comp.productCategory || '',
        productGroup: comp.productGroupId || comp.productGroup || '',
        inspectionType: comp.inspectionType === '100_percent' ? '100%' : (comp.inspectionType || 'sampling'),
        samplingPlan: comp.samplingPlanId || comp.samplingPlan || '',
        qcPlanNo: comp.qcPlanId || comp.qcPlanNo || '',
        drawingNo: comp.drawingNo || '',
        prProcessCode: comp.prProcessCode || '',
        testCertRequired: comp.testCertRequired || false,
        specRequired: comp.specRequired || false,
        fqirRequired: comp.fqirRequired || false,
        skipLotEnabled: comp.skipLotEnabled || false,
        skipLotCount: comp.skipLotCount || '',
        skipLotThreshold: comp.skipLotThreshold || '',
      }));

      setPartCodeValid(true);

      // Load product groups for the category
      if (comp.productCategoryId || comp.productCategory) {
        try {
          const groups = await getProductGroups(comp.productCategoryId || comp.productCategory);
          setProductGroups(groups);
        } catch (e) {
          console.error('Error loading groups:', e);
        }
      }

      // Populate checking parameters
      if (comp.visualParams && comp.visualParams.length > 0) {
        setVisualEnabled(true);
        setVisualParams(comp.visualParams.map((p, i) => ({
          id: p.id || i + 1,
          checkingPoint: p.checkingPoint || '',
          unit: p.unit || '',
          specification: p.specification || '',
          instrumentName: p.instrumentName || '',
        })));
      }
      if (comp.functionalParams && comp.functionalParams.length > 0) {
        setFunctionalEnabled(true);
        setFunctionalParams(comp.functionalParams.map((p, i) => ({
          id: p.id || i + 1,
          checkingPoint: p.checkingPoint || '',
          unit: p.unit || 'mm',
          specification: p.specification || '',
          instrumentName: p.instrumentName || '',
          toleranceMin: p.toleranceMin || '',
          toleranceMax: p.toleranceMax || '',
        })));
      }

      // Populate documents — create File-like objects for FormFileUpload display
      if (comp.documents && comp.documents.length > 0) {
        setExistingDocuments(comp.documents);

        const docTypeToField = {
          'drawing': 'drawingAttachment',
          'test_cert': 'testCertFile',
          'specification': 'specFile',
          'fqir': 'fqirFile',
        };

        const fileUpdates = {};
        comp.documents.forEach(doc => {
          const fieldName = docTypeToField[doc.documentType];
          if (fieldName) {
            // Create a File-like object the FormFileUpload component can display
            fileUpdates[fieldName] = {
              name: doc.fileName,
              size: doc.fileSize || 0,
              type: doc.mimeType || 'application/octet-stream',
              // Custom props to identify this as an existing server file
              _isExisting: true,
              _docId: doc.id,
              _filePath: doc.filePath,
            };
          }
        });

        if (Object.keys(fileUpdates).length > 0) {
          setFormData(prev => ({ ...prev, ...fileUpdates }));
        }
      }

    } catch (error) {
      console.error('Failed to load component:', error);
      alert('Failed to load component data: ' + error.message);
      navigate('/admin/component-master');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (formData.productCategory) {
      const loadGroups = async () => {
        setLoadingGroups(true);
        try {
          const groupsData = await getProductGroups(formData.productCategory);
          setProductGroups(groupsData);
        } catch (error) {
          console.error('Error loading product groups:', error);
        } finally {
          setLoadingGroups(false);
        }
      };
      loadGroups();
    } else {
      setProductGroups([]);
    }
  }, [formData.productCategory]);


  const checkPartCodeUnique = useCallback(
    debounce(async (value) => {
      if (!value || value.length < 3) return;
      setPartCodeChecking(true);
      try {
        const result = await apiValidatePartCode(value);
        setPartCodeValid(result.isUnique);
        if (!result.isUnique) {
          setErrors(prev => setFieldError(prev, 'partCode', 'This part code already exists'));
        }
      } catch (error) {
        console.error('Part code validation error:', error);
      } finally {
        setPartCodeChecking(false);
      }
    }, 500),
    []
  );


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));


    if (errors[name]) {
      setErrors(prev => clearFieldError(prev, name));
    }


    if (name === 'partCode') {
      setPartCodeValid(false);
      checkPartCodeUnique(value);
    }


    if (name === 'inspectionType' && value === '100%') {
      setFormData(prev => ({ ...prev, samplingPlan: '' }));
      setErrors(prev => clearFieldError(prev, 'samplingPlan'));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));


    const error = validateField(name, value, formData);
    if (error) {
      setErrors(prev => setFieldError(prev, name, error));
    }
  };

  const handleFileChange = async (e) => {
    const { name, value, error } = e.target;

    // If removing a file that was previously uploaded to the server, delete it
    const currentFile = formData[name];
    if (!value && currentFile && currentFile._isExisting && currentFile._docId) {
      try {
        await deleteDocument(currentFile._docId);
        setExistingDocuments(prev => prev.filter(d => d.id !== currentFile._docId));
      } catch (delErr) {
        console.error('Error deleting document:', delErr);
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) {
      setErrors(prev => setFieldError(prev, name, error));
    } else {
      setErrors(prev => clearFieldError(prev, name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);


    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);


    if (!visualEnabled && !functionalEnabled) {

      const section = document.querySelector('.cm-checking-type-selector');
      section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isValid) {

      const firstErrorField = Object.keys(validationErrors).find(key => validationErrors[key]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }


    let checkingType = '';
    if (visualEnabled && functionalEnabled) {
      checkingType = 'dimensional_visual';
    } else if (visualEnabled) {
      checkingType = 'visual';
    } else if (functionalEnabled) {
      checkingType = 'functional';
    }


    const allParams = [];
    if (visualEnabled) {
      visualParams
        .filter(p => p.checkingPoint.trim() !== '')
        .forEach((p, i) => allParams.push({ ...p, type: 'visual', id: allParams.length + 1 }));
    }
    if (functionalEnabled) {
      functionalParams
        .filter(p => p.checkingPoint.trim() !== '')
        .forEach((p, i) => allParams.push({ ...p, type: 'functional', id: allParams.length + 1 }));
    }


    const submissionData = {
      ...formData,
      checkingParameters: {
        type: checkingType,
        parameters: allParams,
      }
    };


    setIsSubmitting(true);
    try {
      let savedComp;
      if (isEditing) {
        savedComp = await updateComponent(id, submissionData);
      } else {
        savedComp = await createComponent(submissionData);
      }

      // Upload any NEW files (actual File objects, not existing server files)
      const componentId = isEditing ? id : (savedComp?.id || null);
      if (componentId) {
        const fileFields = ['drawingAttachment', 'testCertFile', 'specFile', 'fqirFile'];
        for (const fieldName of fileFields) {
          const fileVal = formData[fieldName];
          if (fileVal && fileVal instanceof File) {
            try {
              await uploadAttachment(fileVal, componentId, fieldName);
            } catch (uploadErr) {
              console.error(`Error uploading ${fieldName}:`, uploadErr);
            }
          }
        }
      }

      setShowSuccess(true);
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} component:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} component: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(getInitialFormState());
    setErrors(getInitialErrorState());
    setTouched({});
    setPartCodeValid(false);
    setVisualEnabled(false);
    setFunctionalEnabled(false);
    setVisualParams([{ id: 1, checkingPoint: '', unit: '', specification: '', instrumentName: '' }]);
    setFunctionalParams([{ id: 1, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }]);
    setVisualCollapsed(false);
    setFunctionalCollapsed(false);
    setShowParamSummary(false);
  };


  const unitOptions = [
    { value: '', label: '—' },
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
    { value: 'CM', label: 'CM' },
    { value: 'inch', label: 'inch' },
    { value: 'kg', label: 'kg' },
    { value: 'g', label: 'g' },
    { value: 'nos', label: 'Nos' },
    { value: 'pcs', label: 'Pcs' },
    { value: 'units', label: 'Units' },
    { value: 'ply', label: 'Ply' },
    { value: '%', label: '%' },
    { value: 'V', label: 'V' },
    { value: 'A', label: 'A' },
    { value: 'Ω', label: 'Ω' },
    { value: 'MHz', label: 'MHz' },
    { value: 'PIN', label: 'PIN' },
    { value: 'CORE', label: 'CORE' },
    { value: 'ZZ', label: 'ZZ' },
  ];

  const instrumentOptions = [
    { value: '', label: 'Select Instrument' },
    { value: 'Visual', label: 'Visual' },
    { value: 'Scale', label: 'Scale' },
    { value: 'Vernier', label: 'Vernier Caliper' },
    { value: 'Micrometer', label: 'Micrometer' },
    { value: 'Multimeter', label: 'Multimeter' },
    { value: 'Oscilloscope', label: 'Oscilloscope' },
    { value: 'Gauge', label: 'Gauge' },
  ];


  const toggleCheckingType = (type) => {
    if (type === 'visual') {
      setVisualEnabled(prev => !prev);
    } else {
      setFunctionalEnabled(prev => !prev);
    }
  };


  const addVisualParam = () => {
    const newId = Math.max(...visualParams.map(p => p.id), 0) + 1;
    setVisualParams([...visualParams, { id: newId, checkingPoint: '', unit: '', specification: '', instrumentName: '' }]);
  };

  const removeVisualParam = (id) => {
    if (visualParams.length > 1) {
      setVisualParams(visualParams.filter(p => p.id !== id));
    }
  };

  const updateVisualParam = (id, field, value) => {
    setVisualParams(visualParams.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };


  const addFunctionalParam = () => {
    const newId = Math.max(...functionalParams.map(p => p.id), 0) + 1;
    setFunctionalParams([...functionalParams, { id: newId, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }]);
  };

  const removeFunctionalParam = (id) => {
    if (functionalParams.length > 1) {
      setFunctionalParams(functionalParams.filter(p => p.id !== id));
    }
  };

  const updateFunctionalParam = (id, field, value) => {
    setFunctionalParams(functionalParams.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    handleReset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const filledVisualCount = visualParams.filter(p => p.checkingPoint.trim() !== '').length;
  const filledFunctionalCount = functionalParams.filter(p => p.checkingPoint.trim() !== '').length;
  const totalParamCount = (visualEnabled ? filledVisualCount : 0) + (functionalEnabled ? filledFunctionalCount : 0);


  return (
    <div className="cm-page">
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#667085' }} />
            <p style={{ marginTop: '16px', color: '#667085' }}>Loading component data...</p>
          </div>
        </div>
      ) : (
      <>
      <Header
        title="Component Master"
        subtitle="Create and manage QC component specifications"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <FormButton
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/admin/component-master')}
            >
              Back to List
            </FormButton>
          </div>
        }
      />

      <div className="cm-content">
        <form onSubmit={handleSubmit}>
          <div className="cm-form-container">
            {/* Form Header */}
            <div className="cm-form-header">
              <div className="cm-form-header-content">
                <div className="cm-form-header-left">
                  <div className="cm-form-icon">
                    <Package size={28} color="white" />
                  </div>
                  <div>
                    <h1 className="cm-form-title">{isEditing ? 'Edit Component' : 'New Component Entry'}</h1>
                    <p className="cm-form-subtitle">{isEditing ? 'Update the component details' : 'Fill in the details to register a new QC component'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <FormButton
                    variant="ghost"
                    icon={RefreshCw}
                    onClick={handleReset}
                    style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    Reset
                  </FormButton>
                </div>
              </div>
            </div>

            {}
            <div className="cm-form-body">
              {}
              <FormSection
                icon={Layers}
                title="Product Classification"
                badge="Step 1 of 5"
              >
                <CategorySelector
                  categories={categories}
                  value={formData.productCategory}
                  onChange={handleChange}
                  error={touched.productCategory && errors.productCategory}
                  required
                />

                <div className="cm-form-grid cm-form-grid-2" style={{ marginTop: '24px' }}>
                  <FormSelect
                    label="Product Group"
                    name="productGroup"
                    value={formData.productGroup}
                    onChange={handleChange}
                    options={productGroups}
                    placeholder={formData.productCategory ? 'Select product group' : 'Select category first'}
                    error={touched.productGroup && errors.productGroup}
                    onBlur={handleBlur}
                    required
                    disabled={!formData.productCategory}
                    loading={loadingGroups}
                  />
                  <FormSelect
                    label="QC Plan"
                    name="qcPlanNo"
                    value={formData.qcPlanNo}
                    onChange={handleChange}
                    options={qcPlans.map(p => ({ value: p.id, label: `${p.id} - ${p.name}` }))}
                    placeholder="Select QC plan"
                    error={touched.qcPlanNo && errors.qcPlanNo}
                    onBlur={handleBlur}
                    required
                    loading={loadingQCPlans}
                  />
                </div>
              </FormSection>

              {}
              <FormSection
                icon={Package}
                title="Part Identification"
                badge="Step 2 of 5"
              >
                <div className="cm-form-grid cm-form-grid-2">
                  <FormInput
                    label="Part Code"
                    name="partCode"
                    value={formData.partCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.partCode && errors.partCode}
                    required
                    placeholder="e.g., RCNA-001"
                    suffix={
                      partCodeChecking ? (
                        <RefreshCw size={14} className="cm-spin" style={{ color: '#2196F3' }} />
                      ) : partCodeValid ? (
                        <CheckCircle size={14} style={{ color: '#4CAF50' }} />
                      ) : null
                    }
                  />
                  <FormInput
                    label="Part Name"
                    name="partName"
                    value={formData.partName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.partName && errors.partName}
                    required
                    placeholder="e.g., CHANNEL FRAME - REGULAR"
                  />
                </div>
                <div className="cm-form-grid cm-form-grid-2" style={{ marginTop: '16px' }}>
                  <FormInput
                    label="Drawing Number"
                    name="drawingNo"
                    value={formData.drawingNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.drawingNo && errors.drawingNo}
                    placeholder="e.g., DWG-001-R3"
                  />
                  <FormSelect
                    label="PR Process Code"
                    name="prProcessCode"
                    value={formData.prProcessCode}
                    onChange={handleChange}
                    options={[
                      { value: 'direct_purchase', label: 'Direct Purchase' },
                      { value: 'internal_job_work', label: 'Internal Job Work' },
                      { value: 'sub_contracting', label: 'Sub Contracting' },
                      { value: 'ec_rep_sticker', label: 'EC Rep Sticker' },
                    ]}
                    placeholder="Select process code"
                    error={touched.prProcessCode && errors.prProcessCode}
                    onBlur={handleBlur}
                  />
                </div>
              </FormSection>

              {}
              <FormSection
                icon={Shield}
                title="Inspection Configuration"
                badge="Step 3 of 5"
              >
                <FormToggle
                  label="Inspection Type"
                  name="inspectionType"
                  value={formData.inspectionType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: '100%', label: '100% Inspection', description: 'Inspect every unit' },
                    { value: 'sampling', label: 'Sampling Inspection', description: 'Inspect based on AQL plan' },
                  ]}
                />
                {formData.inspectionType === 'sampling' && (
                  <div style={{ marginTop: '16px' }}>
                    <FormSelect
                      label="Sampling Plan"
                      name="samplingPlan"
                      value={formData.samplingPlan}
                      onChange={handleChange}
                      options={samplingPlans.map(p => ({ value: p.id, label: `${p.name} (${p.aqlLevel})` }))}
                      placeholder="Select sampling plan"
                      error={touched.samplingPlan && errors.samplingPlan}
                      onBlur={handleBlur}
                      required
                      loading={loadingSamplingPlans}
                    />
                  </div>
                )}
              </FormSection>

              {}
              <FormSection
                icon={FileText}
                title="Documentation & Compliance"
                badge="Step 4 of 5"
              >
                <div className="cm-form-grid cm-form-grid-3">
                  <FormCheckboxCard
                    label="Test Certificate"
                    name="testCertRequired"
                    checked={formData.testCertRequired}
                    onChange={handleChange}
                    description="Vendor test certificate required"
                    icon={Clipboard}
                  />
                  <FormCheckboxCard
                    label="Specification Document"
                    name="specRequired"
                    checked={formData.specRequired}
                    onChange={handleChange}
                    description="Detailed specification required"
                    icon={FileText}
                  />
                  <FormCheckboxCard
                    label="FQIR Document"
                    name="fqirRequired"
                    checked={formData.fqirRequired}
                    onChange={handleChange}
                    description="First Quality Inspection Report"
                    icon={Shield}
                  />
                </div>

                <div className="cm-form-grid cm-form-grid-3" style={{ marginTop: '20px' }}>
                  <FormFileUpload
                    label="Drawing Attachment"
                    name="drawingAttachment"
                    value={formData.drawingAttachment}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.dwg"
                    maxSize={10}
                    error={errors.drawingAttachment}
                    description="Engineering drawing file"
                  />
                  <FormFileUpload
                    label="Test Certificate File"
                    name="testCertFile"
                    value={formData.testCertFile}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    maxSize={5}
                    error={errors.testCertFile}
                    description="Upload vendor test certificate"
                  />
                  <FormFileUpload
                    label="FQIR File"
                    name="fqirFile"
                    value={formData.fqirFile}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    maxSize={5}
                    error={errors.fqirFile}
                    description="First article quality inspection report"
                  />
                </div>
              </FormSection>

              {}
              <FormSection
                icon={Ruler}
                title="Detailed Checking Parameters"
                badge="Step 5 of 5"
              >
                {}
                <div className="cm-checking-type-selector">
                  <label className="cm-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Checking Type
                    <span className="cm-label-required">*</span>
                  </label>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--cm-gray-500)',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    Select one or both checking types. Components can have visual inspection, functional testing, or a combination of both.
                  </p>

                  <div className="cm-checking-type-cards">
                    {}
                    <div
                      className={`cm-checking-type-card ${visualEnabled ? 'cm-checking-type-active' : ''}`}
                      onClick={() => toggleCheckingType('visual')}
                    >
                      <div className="cm-checking-type-checkbox">
                        {visualEnabled && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="cm-checking-type-icon">
                        <Eye size={28} />
                      </div>
                      <div className="cm-checking-type-content">
                        <span className="cm-checking-type-title">Visual Inspection</span>
                        <span className="cm-checking-type-desc">Surface finish, color, appearance, damage checks</span>
                      </div>
                      {visualEnabled && filledVisualCount > 0 && (
                        <span className="cm-checking-type-badge">
                          {filledVisualCount} param{filledVisualCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {}
                    <div
                      className={`cm-checking-type-card ${functionalEnabled ? 'cm-checking-type-active' : ''}`}
                      onClick={() => toggleCheckingType('functional')}
                    >
                      <div className="cm-checking-type-checkbox">
                        {functionalEnabled && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="cm-checking-type-icon">
                        <Wrench size={28} />
                      </div>
                      <div className="cm-checking-type-content">
                        <span className="cm-checking-type-title">Functional Testing</span>
                        <span className="cm-checking-type-desc">Measurements, tolerances, instrument-based</span>
                      </div>
                      {functionalEnabled && filledFunctionalCount > 0 && (
                        <span className="cm-checking-type-badge">
                          {filledFunctionalCount} param{filledFunctionalCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {}
                  {visualEnabled && functionalEnabled && (
                    <div className="cm-combined-type-banner">
                      <div className="cm-combined-type-icon">
                        <Zap size={16} />
                      </div>
                      <div className="cm-combined-type-text">
                        <strong>Combined Inspection:</strong> This component will require both Visual Inspection and Functional Testing stages during QC.
                      </div>
                    </div>
                  )}

                  {}
                  {!visualEnabled && !functionalEnabled && (
                    <div className="cm-no-type-hint">
                      <AlertCircle size={14} />
                      <span>Please select at least one checking type to define parameters</span>
                    </div>
                  )}
                </div>

                {}
                {visualEnabled && (
                  <div className="cm-param-section" style={{ marginTop: '24px' }}>
                    <div className="cm-param-header">
                      <div className="cm-param-title">
                        <Eye size={18} className="cm-param-icon" />
                        <span>Visual Checking Parameters</span>
                        <span className="cm-param-count">{visualParams.length} parameter(s)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="cm-btn cm-btn-outline cm-btn-sm"
                          onClick={addVisualParam}
                        >
                          <Plus size={16} /> Add Parameter
                        </button>
                        <button
                          type="button"
                          className="cm-btn-icon"
                          onClick={() => setVisualCollapsed(!visualCollapsed)}
                          title={visualCollapsed ? 'Expand' : 'Collapse'}
                        >
                          {visualCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                      </div>
                    </div>

                    {!visualCollapsed && (
                      <div className="cm-param-table">
                        <div className="cm-param-table-header">
                          <div className="cm-param-col cm-param-col-sl">Sl.No</div>
                          <div className="cm-param-col cm-param-col-check">Checking Point</div>
                          <div className="cm-param-col cm-param-col-unit">Unit</div>
                          <div className="cm-param-col cm-param-col-spec">Specification</div>
                          <div className="cm-param-col cm-param-col-inst">Instrument</div>
                          <div className="cm-param-col cm-param-col-action">Action</div>
                        </div>
                        {visualParams.map((param, index) => (
                          <div key={param.id} className="cm-param-row">
                            <div className="cm-param-col cm-param-col-sl">{index + 1}</div>
                            <div className="cm-param-col cm-param-col-check">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="e.g., Surface Finish, Damage Checking"
                                value={param.checkingPoint}
                                onChange={(e) => updateVisualParam(param.id, 'checkingPoint', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-unit">
                              <select
                                className="cm-select cm-select-sm"
                                value={param.unit}
                                onChange={(e) => updateVisualParam(param.id, 'unit', e.target.value)}
                              >
                                {unitOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="cm-param-col cm-param-col-spec">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="e.g., No scratches, As per sample"
                                value={param.specification}
                                onChange={(e) => updateVisualParam(param.id, 'specification', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-inst">
                              <select
                                className="cm-select cm-select-sm"
                                value={param.instrumentName}
                                onChange={(e) => updateVisualParam(param.id, 'instrumentName', e.target.value)}
                              >
                                {instrumentOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="cm-param-col cm-param-col-action">
                              <button
                                type="button"
                                className="cm-btn-icon cm-btn-danger-icon"
                                onClick={() => removeVisualParam(param.id)}
                                disabled={visualParams.length === 1}
                                title="Remove parameter"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {}
                {functionalEnabled && (
                  <div className="cm-param-section" style={{ marginTop: '24px' }}>
                    <div className="cm-param-header">
                      <div className="cm-param-title">
                        <Wrench size={18} className="cm-param-icon" />
                        <span>Functional Checking Parameters</span>
                        <span className="cm-param-count">{functionalParams.length} parameter(s)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="cm-btn cm-btn-outline cm-btn-sm"
                          onClick={addFunctionalParam}
                        >
                          <Plus size={16} /> Add Parameter
                        </button>
                        <button
                          type="button"
                          className="cm-btn-icon"
                          onClick={() => setFunctionalCollapsed(!functionalCollapsed)}
                          title={functionalCollapsed ? 'Expand' : 'Collapse'}
                        >
                          {functionalCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                      </div>
                    </div>

                    {!functionalCollapsed && (
                      <div className="cm-param-table cm-param-table-functional">
                        <div className="cm-param-table-header">
                          <div className="cm-param-col cm-param-col-sl">Sl.No</div>
                          <div className="cm-param-col cm-param-col-check-sm">Checking Point</div>
                          <div className="cm-param-col cm-param-col-unit">Unit</div>
                          <div className="cm-param-col cm-param-col-spec-sm">Specification</div>
                          <div className="cm-param-col cm-param-col-inst">Instrument</div>
                          <div className="cm-param-col cm-param-col-tol">Tol. Min</div>
                          <div className="cm-param-col cm-param-col-tol">Tol. Max</div>
                          <div className="cm-param-col cm-param-col-action">Action</div>
                        </div>
                        {functionalParams.map((param, index) => (
                          <div key={param.id} className="cm-param-row">
                            <div className="cm-param-col cm-param-col-sl">{index + 1}</div>
                            <div className="cm-param-col cm-param-col-check-sm">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="e.g., Length, Diameter"
                                value={param.checkingPoint}
                                onChange={(e) => updateFunctionalParam(param.id, 'checkingPoint', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-unit">
                              <select
                                className="cm-select cm-select-sm"
                                value={param.unit}
                                onChange={(e) => updateFunctionalParam(param.id, 'unit', e.target.value)}
                              >
                                {unitOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="cm-param-col cm-param-col-spec-sm">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="e.g., 250mm +/-0.5"
                                value={param.specification}
                                onChange={(e) => updateFunctionalParam(param.id, 'specification', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-inst">
                              <select
                                className="cm-select cm-select-sm"
                                value={param.instrumentName}
                                onChange={(e) => updateFunctionalParam(param.id, 'instrumentName', e.target.value)}
                              >
                                {instrumentOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="cm-param-col cm-param-col-tol">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="Min"
                                value={param.toleranceMin}
                                onChange={(e) => updateFunctionalParam(param.id, 'toleranceMin', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-tol">
                              <input
                                type="text"
                                className="cm-input cm-input-sm"
                                placeholder="Max"
                                value={param.toleranceMax}
                                onChange={(e) => updateFunctionalParam(param.id, 'toleranceMax', e.target.value)}
                              />
                            </div>
                            <div className="cm-param-col cm-param-col-action">
                              <button
                                type="button"
                                className="cm-btn-icon cm-btn-danger-icon"
                                onClick={() => removeFunctionalParam(param.id)}
                                disabled={functionalParams.length === 1}
                                title="Remove parameter"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {}
                {(visualEnabled || functionalEnabled) && totalParamCount > 0 && (
                  <div className="cm-param-summary" style={{ marginTop: '24px' }}>
                    <div
                      className="cm-param-summary-header"
                      onClick={() => setShowParamSummary(!showParamSummary)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cm-param-summary-title">
                        <CheckCircle size={18} style={{ color: 'var(--cm-success)' }} />
                        <span>Parameter Summary — {totalParamCount} total checkpoint{totalParamCount !== 1 ? 's' : ''}</span>
                        {visualEnabled && functionalEnabled && (
                          <span className="cm-param-summary-combined-badge">Combined</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {visualEnabled && (
                            <span className="cm-param-summary-type-pill cm-param-summary-type-visual">
                              <Eye size={12} /> {filledVisualCount} Visual
                            </span>
                          )}
                          {functionalEnabled && (
                            <span className="cm-param-summary-type-pill cm-param-summary-type-functional">
                              <Wrench size={12} /> {filledFunctionalCount} Functional
                            </span>
                          )}
                        </div>
                        {showParamSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {showParamSummary && (
                      <div className="cm-param-summary-body">
                        {}
                        {visualEnabled && filledVisualCount > 0 && (
                          <div className="cm-param-summary-section">
                            <div className="cm-param-summary-section-header">
                              <Eye size={14} />
                              <span>Visual Inspection Parameters</span>
                            </div>
                            <table className="cm-param-summary-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '40px' }}>#</th>
                                  <th>Checking Point</th>
                                  <th>Unit</th>
                                  <th>Specification</th>
                                  <th>Instrument</th>
                                </tr>
                              </thead>
                              <tbody>
                                {visualParams.filter(p => p.checkingPoint.trim() !== '').map((p, i) => (
                                  <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{p.checkingPoint}</td>
                                    <td>{p.unit || '—'}</td>
                                    <td>{p.specification || '—'}</td>
                                    <td>{p.instrumentName || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {}
                        {functionalEnabled && filledFunctionalCount > 0 && (
                          <div className="cm-param-summary-section">
                            <div className="cm-param-summary-section-header">
                              <Wrench size={14} />
                              <span>Functional Testing Parameters</span>
                            </div>
                            <table className="cm-param-summary-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '40px' }}>#</th>
                                  <th>Checking Point</th>
                                  <th>Unit</th>
                                  <th>Specification</th>
                                  <th>Instrument</th>
                                  <th>Tol. Min</th>
                                  <th>Tol. Max</th>
                                </tr>
                              </thead>
                              <tbody>
                                {functionalParams.filter(p => p.checkingPoint.trim() !== '').map((p, i) => (
                                  <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{p.checkingPoint}</td>
                                    <td>{p.unit || '—'}</td>
                                    <td>{p.specification || '—'}</td>
                                    <td>{p.instrumentName || '—'}</td>
                                    <td>{p.toleranceMin || '—'}</td>
                                    <td>{p.toleranceMax || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </FormSection>
            </div>

            {}
            <div className="cm-form-footer">
              <div className="cm-form-footer-left">
                <FormButton
                  variant="ghost"
                  icon={RefreshCw}
                  onClick={handleReset}
                  type="button"
                >
                  Reset Form
                </FormButton>
              </div>
              <div className="cm-form-footer-right">
                <FormButton
                  variant="outline"
                  onClick={() => navigate('/admin/component-master')}
                  type="button"
                >
                  Cancel
                </FormButton>
                <FormButton
                  variant="primary"
                  icon={Save}
                  type="submit"
                  loading={isSubmitting}
                >
                  {isEditing ? 'Update Component' : 'Save Component'}
                </FormButton>
              </div>
            </div>
          </div>
        </form>
      </div>

      {}
      {showSuccess && (
        <SuccessModal
          title={isEditing ? 'Component Updated!' : 'Component Created!'}
          message={`${formData.partCode} - ${formData.partName} has been successfully ${isEditing ? 'updated' : 'registered'}.`}
          onClose={() => {
            setShowSuccess(false);
            navigate('/admin/component-master');
          }}
          onCreateAnother={isEditing ? undefined : handleCreateAnother}
        />
      )}
      </>
      )}
    </div>
  );
};

export default ComponentMasterEntryPage;
