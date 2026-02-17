import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
  FileText,
  Building2,
  Package,
  Save,
  X,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Hash,
  Link2,
  CheckCircle,
  Shield,
  Award,
  Plus,
  Trash2,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

// Components
import {
  FormInput,
  FormSelect,
  FormSection,
  FormButton,
  SuccessModal,
  LoadingSpinner,
  DepartmentInfo,
} from './components/FormComponents';

// API
import {
  createQualityPlan,
  updateQualityPlan,
  fetchQualityPlanById,
  validateQCPlanNo,
  fetchDepartments,
  fetchProducts,
  fetchSamplingPlans,
  SAMPLING_API_CONFIG,
} from './api/samplingMasterApi';

// Validation
import {
  validateQualityPlanForm,
  hasErrors,
  getInitialQualityPlanState,
  debounce,
} from './api/validation';

// Styles
import './styles/SamplingMaster.css';

// ─── Default stage/parameter creators ──────────────────────────────────────
const createDefaultParameter = (sequence = 1) => ({
  _key: `param-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  parameterName: '',
  parameterSequence: sequence,
  checkingType: 'visual',
  specification: '',
  nominalValue: '',
  toleranceMin: '',
  toleranceMax: '',
  unitId: '',
  instrumentId: '',
  inputType: 'pass_fail',
  isMandatory: true,
  acceptanceCriteria: '',
});

const createDefaultStage = (sequence = 1) => ({
  _key: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  stageName: '',
  stageType: 'visual',
  stageSequence: sequence,
  inspectionType: 'sampling',
  samplingPlanId: '',
  isMandatory: true,
  requiresInstrument: false,
  parameters: [createDefaultParameter(1)],
});

// ─── Dropdown Options ───────────────────────────────────────────────────────
const STAGE_TYPES = [
  { id: 'visual', name: 'Visual' },
  { id: 'functional', name: 'Functional' },
  { id: 'dimensional', name: 'Dimensional' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'weight', name: 'Weight' },
];

const INSPECTION_TYPES = [
  { id: 'sampling', name: 'Sampling Based' },
  { id: '100_percent', name: '100% Inspection' },
];

const CHECKING_TYPES = [
  { id: 'visual', name: 'Visual' },
  { id: 'functional', name: 'Functional' },
  { id: 'dimensional', name: 'Dimensional' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'weight', name: 'Weight' },
  { id: 'measurement', name: 'Measurement' },
];

const INPUT_TYPES = [
  { id: 'pass_fail', name: 'Pass / Fail' },
  { id: 'measurement', name: 'Measurement' },
  { id: 'yes_no', name: 'Yes / No' },
  { id: 'text', name: 'Text' },
  { id: 'numeric', name: 'Numeric' },
];


// ═══════════════════════════════════════════════════════════════════════════
// Parameter Row Component
// ═══════════════════════════════════════════════════════════════════════════
const ParameterRow = ({ param, index, onChange, onRemove, canRemove }) => {
  const handleFieldChange = (field, value) => {
    onChange(index, { ...param, [field]: value });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 140px 1fr 120px 60px',
      gap: '10px',
      alignItems: 'start',
      padding: '12px 16px',
      background: index % 2 === 0 ? '#FAFBFC' : '#FFFFFF',
      borderRadius: '6px',
      border: '1px solid #E8ECF0',
    }}>
      {/* Parameter Name */}
      <div>
        <input
          type="text"
          value={param.parameterName}
          onChange={(e) => handleFieldChange('parameterName', e.target.value)}
          placeholder="e.g., Surface Finish"
          className="sm-input"
          style={{ fontSize: '13px', padding: '8px 12px' }}
        />
      </div>

      {/* Checking Type */}
      <div>
        <select
          value={param.checkingType}
          onChange={(e) => handleFieldChange('checkingType', e.target.value)}
          className="sm-input"
          style={{ fontSize: '13px', padding: '8px 12px' }}
        >
          {CHECKING_TYPES.map(ct => (
            <option key={ct.id} value={ct.id}>{ct.name}</option>
          ))}
        </select>
      </div>

      {/* Specification */}
      <div>
        <input
          type="text"
          value={param.specification || ''}
          onChange={(e) => handleFieldChange('specification', e.target.value)}
          placeholder="e.g., No scratches"
          className="sm-input"
          style={{ fontSize: '13px', padding: '8px 12px' }}
        />
      </div>

      {/* Input Type */}
      <div>
        <select
          value={param.inputType}
          onChange={(e) => handleFieldChange('inputType', e.target.value)}
          className="sm-input"
          style={{ fontSize: '13px', padding: '8px 12px' }}
        >
          {INPUT_TYPES.map(it => (
            <option key={it.id} value={it.id}>{it.name}</option>
          ))}
        </select>
      </div>

      {/* Remove */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: canRemove ? '#FEE2E2' : '#F1F5F9',
            color: canRemove ? '#DC2626' : '#94A3B8',
            cursor: canRemove ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title={canRemove ? 'Remove parameter' : 'At least one parameter required'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// Stage Card Component
// ═══════════════════════════════════════════════════════════════════════════
const StageCard = ({
  stage,
  stageIndex,
  onChange,
  onRemove,
  canRemove,
  samplingPlans,
  stageErrors,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleStageFieldChange = (field, value) => {
    onChange(stageIndex, { ...stage, [field]: value });
  };

  const handleParameterChange = (paramIndex, updatedParam) => {
    const newParams = [...stage.parameters];
    newParams[paramIndex] = updatedParam;
    onChange(stageIndex, { ...stage, parameters: newParams });
  };

  const handleAddParameter = () => {
    const nextSeq = stage.parameters.length + 1;
    onChange(stageIndex, {
      ...stage,
      parameters: [...stage.parameters, createDefaultParameter(nextSeq)],
    });
  };

  const handleRemoveParameter = (paramIndex) => {
    if (stage.parameters.length <= 1) return;
    const newParams = stage.parameters
      .filter((_, i) => i !== paramIndex)
      .map((p, i) => ({ ...p, parameterSequence: i + 1 }));
    onChange(stageIndex, { ...stage, parameters: newParams });
  };

  const hasStageError = stageErrors && Object.keys(stageErrors).length > 0;

  return (
    <div style={{
      border: `1px solid ${hasStageError ? '#FCA5A5' : '#E2E8F0'}`,
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'border-color 0.2s',
    }}>
      {/* Stage Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: hasStageError ? '#FEF2F2' : '#F8FAFC',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: hasStageError ? '#DC2626' : '#003366',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '700',
          }}>
            {stageIndex + 1}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1E293B' }}>
              {stage.stageName || `Stage ${stageIndex + 1}`}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              {STAGE_TYPES.find(t => t.id === stage.stageType)?.name || 'Visual'} &middot;{' '}
              {stage.parameters.length} parameter{stage.parameters.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(stageIndex);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#DC2626',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          )}
          {expanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </div>
      </div>

      {/* Stage Body */}
      {expanded && (
        <div style={{ padding: '20px' }}>
          {/* Stage Config Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}>
            {/* Stage Name */}
            <div className="sm-field">
              <label className="sm-label">
                Stage Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={stage.stageName}
                onChange={(e) => handleStageFieldChange('stageName', e.target.value)}
                placeholder="e.g., Visual Inspection"
                className="sm-input"
                style={{
                  borderColor: stageErrors?.stageName ? '#DC2626' : undefined,
                }}
              />
              {stageErrors?.stageName && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {stageErrors.stageName}
                </div>
              )}
            </div>

            {/* Stage Type */}
            <div className="sm-field">
              <label className="sm-label">
                Stage Type <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={stage.stageType}
                onChange={(e) => handleStageFieldChange('stageType', e.target.value)}
                className="sm-input"
              >
                {STAGE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Inspection Type */}
            <div className="sm-field">
              <label className="sm-label">Inspection Type</label>
              <select
                value={stage.inspectionType}
                onChange={(e) => handleStageFieldChange('inspectionType', e.target.value)}
                className="sm-input"
              >
                {INSPECTION_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Sampling Plan */}
            <div className="sm-field">
              <label className="sm-label">Sampling Plan</label>
              <select
                value={stage.samplingPlanId || ''}
                onChange={(e) => handleStageFieldChange('samplingPlanId', e.target.value ? Number(e.target.value) : null)}
                className="sm-input"
                disabled={stage.inspectionType !== 'sampling'}
              >
                <option value="">None</option>
                {samplingPlans.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.samplePlanNo || sp.planCode || ''} - {sp.samplePlanName || sp.planName || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parameters Section */}
          <div style={{
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Parameters Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#F1F5F9',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                QC Parameters
              </div>
              <button
                type="button"
                onClick={handleAddParameter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #003366',
                  background: 'white',
                  color: '#003366',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                <Plus size={12} /> Add Parameter
              </button>
            </div>

            {/* Column Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 1fr 120px 60px',
              gap: '10px',
              padding: '8px 16px',
              background: '#F8FAFC',
              borderBottom: '1px solid #E8ECF0',
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <div>Parameter Name *</div>
              <div>Checking Type</div>
              <div>Specification</div>
              <div>Input Type</div>
              <div style={{ textAlign: 'center' }}></div>
            </div>

            {/* Parameter Rows */}
            <div style={{ padding: '8px' }}>
              {stage.parameters.map((param, pIdx) => (
                <ParameterRow
                  key={param._key || param.id || pIdx}
                  param={param}
                  index={pIdx}
                  onChange={handleParameterChange}
                  onRemove={handleRemoveParameter}
                  canRemove={stage.parameters.length > 1}
                />
              ))}
            </div>

            {stageErrors?.parameters && (
              <div style={{
                padding: '8px 16px 12px',
                color: '#DC2626',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertCircle size={14} />
                {stageErrors.parameters}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════════════
const QualityPlanConfigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState(getInitialQualityPlanState());
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Lookups
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [samplingPlans, setSamplingPlans] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Department detail
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Plan number validation
  const [planNoValid, setPlanNoValid] = useState(false);
  const [planNoChecking, setPlanNoChecking] = useState(false);

  // Stage errors
  const [stageErrors, setStageErrors] = useState([]);

  // ─── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (isEditing) {
      loadQualityPlan();
    }
  }, [id]);

  const loadMasterData = async () => {
    // Departments
    setLoadingDepartments(true);
    try {
      const deptResponse = await fetchDepartments();
      if (deptResponse.success) setDepartments(deptResponse.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoadingDepartments(false);
    }

    // Products
    setLoadingProducts(true);
    try {
      const prodResponse = await fetchProducts();
      if (prodResponse.success) setProducts(prodResponse.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }

    // Sampling Plans
    try {
      const spResponse = await fetchSamplingPlans();
      if (spResponse.success) setSamplingPlans(spResponse.data || []);
    } catch (error) {
      console.error('Failed to load sampling plans:', error);
    }
  };

  const loadQualityPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetchQualityPlanById(id);
      if (response.success && response.data) {
        const data = { ...response.data };
        // Ensure stages have _key for React rendering
        if (data.stages && data.stages.length > 0) {
          data.stages = data.stages.map(s => ({
            ...s,
            _key: s._key || `stage-${s.id || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            parameters: (s.parameters || []).map(p => ({
              ...p,
              _key: p._key || `param-${p.id || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            })),
          }));
        } else {
          data.stages = [createDefaultStage(1)];
        }
        setFormData(data);
        setPlanNoValid(true);

        const dept = departments.find(d => d.id === data.departmentId);
        setSelectedDepartment(dept);
      }
    } catch (error) {
      console.error('Failed to load quality plan:', error);
      alert('Failed to load quality plan');
      navigate('/admin/sampling-master');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Plan Number Validation ────────────────────────────────────────────
  const validatePlanNo = useCallback(
    debounce(async (planNo) => {
      if (!planNo || planNo.length < 2) {
        setPlanNoValid(false);
        return;
      }
      setPlanNoChecking(true);
      try {
        const result = await validateQCPlanNo(planNo, isEditing ? id : null);
        setPlanNoValid(result.isUnique);
        if (!result.isUnique) {
          setErrors(prev => ({ ...prev, qcPlanNo: 'This plan number already exists' }));
        } else {
          setErrors(prev => {
            const { qcPlanNo, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setPlanNoChecking(false);
      }
    }, 500),
    [isEditing, id]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    if (name === 'qcPlanNo') {
      setPlanNoValid(false);
      validatePlanNo(value);
    }

    if (name === 'departmentId') {
      const dept = departments.find(d => d.id === value);
      setSelectedDepartment(dept);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ─── Stage Handlers ────────────────────────────────────────────────────
  const handleAddStage = () => {
    const nextSeq = (formData.stages || []).length + 1;
    setFormData(prev => ({
      ...prev,
      stages: [...(prev.stages || []), createDefaultStage(nextSeq)],
    }));
  };

  const handleStageChange = (stageIndex, updatedStage) => {
    const newStages = [...(formData.stages || [])];
    newStages[stageIndex] = updatedStage;
    setFormData(prev => ({ ...prev, stages: newStages }));

    // Clear stage errors for this stage
    if (stageErrors[stageIndex]) {
      const newErrors = [...stageErrors];
      newErrors[stageIndex] = {};
      setStageErrors(newErrors);
    }
  };

  const handleRemoveStage = (stageIndex) => {
    if ((formData.stages || []).length <= 1) return;
    const newStages = (formData.stages || [])
      .filter((_, i) => i !== stageIndex)
      .map((s, i) => ({ ...s, stageSequence: i + 1 }));
    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  // ─── Validate stages ──────────────────────────────────────────────────
  const validateStages = () => {
    const stages = formData.stages || [];
    const errors = [];
    let hasError = false;

    if (stages.length === 0) return { valid: false, errors: [] };

    stages.forEach((stage) => {
      const stageErr = {};
      if (!stage.stageName || !stage.stageName.trim()) {
        stageErr.stageName = 'Stage name is required';
        hasError = true;
      }
      const filledParams = (stage.parameters || []).filter(p => p.parameterName && p.parameterName.trim());
      if (filledParams.length === 0) {
        stageErr.parameters = 'At least one parameter with a name is required';
        hasError = true;
      }
      errors.push(stageErr);
    });

    return { valid: !hasError, errors };
  };

  // ─── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate top-level fields
    const validationErrors = validateQualityPlanForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    if (!planNoValid && !isEditing) {
      setErrors(prev => ({ ...prev, qcPlanNo: 'Please enter a unique plan number' }));
      return;
    }

    // Validate stages
    const stageValidation = validateStages();
    if (!stageValidation.valid) {
      setStageErrors(stageValidation.errors);
      const stagesSection = document.getElementById('stages-section');
      stagesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up stages before sending
      const cleanedFormData = {
        ...formData,
        stages: (formData.stages || []).map((stage, sIdx) => ({
          ...stage,
          stageSequence: sIdx + 1,
          parameters: (stage.parameters || [])
            .filter(p => p.parameterName && p.parameterName.trim())
            .map((p, pIdx) => ({
              ...p,
              parameterSequence: pIdx + 1,
            })),
        })),
      };

      if (isEditing) {
        await updateQualityPlan(id, cleanedFormData);
      } else {
        await createQualityPlan(cleanedFormData);
      }
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} quality plan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData(getInitialQualityPlanState());
      setErrors({});
      setTouched({});
      setPlanNoValid(false);
      setSelectedDepartment(null);
      setStageErrors([]);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/admin/sampling-master');
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setFormData(getInitialQualityPlanState());
    setErrors({});
    setTouched({});
    setPlanNoValid(false);
    setSelectedDepartment(null);
    setStageErrors([]);
  };

  // ─── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="sm-page">
        <div className="sm-content">
          <LoadingSpinner message="Loading quality plan..." />
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="sm-page">
      <div className="sm-content">
        {/* Page Header */}
        <div className="sm-page-header">
          <div className="sm-page-header-left">
            <button
              className="sm-back-btn"
              onClick={() => navigate('/admin/sampling-master')}
              title="Back to list"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="sm-page-icon">
              <ClipboardList size={28} />
            </div>
            <div>
              <h1 className="sm-page-title">
                {isEditing ? 'Edit Quality Plan' : 'Create Quality Plan'}
              </h1>
              <p className="sm-page-subtitle">
                Link products with QC parameters and departments
              </p>
            </div>
          </div>
          <div className="sm-page-header-right">
            {SAMPLING_API_CONFIG.useMockData && (
              <span style={{
                padding: '6px 12px',
                background: '#FEF3C7',
                color: '#D97706',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                Mock Mode
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="sm-form-container">
            {/* Form Header */}
            <div className="sm-form-header">
              <div className="sm-form-header-content">
                <div className="sm-form-header-left">
                  <div className="sm-form-icon-large">
                    <Award size={36} />
                  </div>
                  <div>
                    <h2 className="sm-form-title">Quality Plan Configuration</h2>
                    <p className="sm-form-subtitle">
                      Define QC parameters for products with department mapping
                    </p>
                    <div className="sm-form-badge">
                      <Shield size={14} />
                      ISO 9001 Compliant
                    </div>
                  </div>
                </div>
                <div className="sm-form-header-stats">
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value">{products.length}</div>
                    <div className="sm-header-stat-label">Products</div>
                  </div>
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value">{departments.length}</div>
                    <div className="sm-header-stat-label">Departments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="sm-form-body">
              {/* Step 1: Plan Information */}
              <FormSection
                icon={Hash}
                title="Plan Information"
                badge="Step 1 of 4"
              >
                <div className="sm-form-grid sm-form-grid-2">
                  <FormInput
                    label="QC Plan Number"
                    name="qcPlanNo"
                    value={formData.qcPlanNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., RD.7.3-07"
                    required
                    error={touched.qcPlanNo && errors.qcPlanNo}
                    success={planNoValid && !errors.qcPlanNo}
                    helper={planNoChecking ? 'Checking availability...' : planNoValid ? 'Plan number is available!' : null}
                    icon={Hash}
                    maxLength={30}
                  />

                  <FormInput
                    label="Plan Name"
                    name="planName"
                    value={formData.planName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., B-SCAN Transducer QC Plan"
                    icon={FileText}
                    maxLength={200}
                  />
                </div>

                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '24px' }}>
                  <FormInput
                    label="Document Revision No"
                    name="documentRevNo"
                    value={formData.documentRevNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Rev-03"
                    required
                    error={touched.documentRevNo && errors.documentRevNo}
                    icon={FileText}
                    maxLength={20}
                  />

                  <FormInput
                    label="Revision Date"
                    name="revisionDate"
                    type="date"
                    value={formData.revisionDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={touched.revisionDate && errors.revisionDate}
                    icon={Calendar}
                  />
                </div>
              </FormSection>

              {/* Step 2: Product Selection */}
              <FormSection
                icon={Package}
                title="Product Selection"
                badge="Step 2 of 4"
              >
                <div className="sm-form-grid sm-form-grid-2">
                  <FormSelect
                    label="Product Name"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    options={products.map(p => ({
                      id: p.id,
                      name: `${p.code} - ${p.name}`
                    }))}
                    placeholder="Select a product"
                    required
                    loading={loadingProducts}
                    error={touched.productId && errors.productId}
                  />
                </div>

                {formData.productId && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px 20px',
                    background: 'var(--sm-success-light)',
                    borderRadius: 'var(--sm-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <CheckCircle size={20} style={{ color: 'var(--sm-success)' }} />
                    <span style={{ color: 'var(--sm-success)', fontWeight: '500' }}>
                      Product selected: {products.find(p => p.id === formData.productId)?.name || 'Unknown'}
                    </span>
                  </div>
                )}
              </FormSection>

              {/* Step 3: Department Configuration */}
              <FormSection
                icon={Building2}
                title="Department Configuration"
                badge="Step 3 of 4"
              >
                <div className="sm-form-grid sm-form-grid-2">
                  <FormSelect
                    label="Department"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    options={departments.map(d => ({
                      id: d.id,
                      name: `${d.code} - ${d.name}`
                    }))}
                    placeholder="Select a department"
                    required
                    loading={loadingDepartments}
                    error={touched.departmentId && errors.departmentId}
                    helper="Quality plan must be linked with relevant department"
                  />
                </div>

                {selectedDepartment && (
                  <DepartmentInfo department={selectedDepartment} />
                )}

                {/* Description */}
                <div style={{ marginTop: '24px' }}>
                  <div className="sm-field">
                    <label className="sm-label" htmlFor="description">
                      Description
                      <span className="sm-label-optional">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter a brief description of this quality plan..."
                      className="sm-input"
                      rows={3}
                      style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                  </div>
                </div>
              </FormSection>

              {/* ═══════════ Step 4: Inspection Stages & Parameters ═══════════ */}
              <FormSection
                icon={Layers}
                title="Inspection Stages & Parameters"
                badge="Step 4 of 4"
              >
                <div id="stages-section">
                  {/* Info banner */}
                  <div style={{
                    padding: '12px 16px',
                    background: '#EFF6FF',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#1E40AF',
                  }}>
                    <AlertCircle size={16} />
                    <span>
                      Define at least one inspection stage with at least one QC parameter. Each stage represents an inspection step (e.g., Visual, Functional, Dimensional).
                    </span>
                  </div>

                  {/* Stage Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(formData.stages || []).map((stage, sIdx) => (
                      <StageCard
                        key={stage._key || stage.id || sIdx}
                        stage={stage}
                        stageIndex={sIdx}
                        onChange={handleStageChange}
                        onRemove={handleRemoveStage}
                        canRemove={(formData.stages || []).length > 1}
                        samplingPlans={samplingPlans}
                        stageErrors={stageErrors[sIdx] || {}}
                      />
                    ))}
                  </div>

                  {/* Add Stage Button */}
                  <button
                    type="button"
                    onClick={handleAddStage}
                    style={{
                      marginTop: '16px',
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px dashed #CBD5E1',
                      background: '#FAFBFC',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#003366',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#003366';
                      e.currentTarget.style.background = '#F0F7FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.background = '#FAFBFC';
                    }}
                  >
                    <Plus size={18} />
                    Add Another Stage
                  </button>

                  {/* Summary */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: '24px',
                    fontSize: '13px',
                    color: '#475569',
                  }}>
                    <span>
                      <strong>{(formData.stages || []).length}</strong> Stage{(formData.stages || []).length !== 1 ? 's' : ''}
                    </span>
                    <span>
                      <strong>
                        {(formData.stages || []).reduce((sum, s) =>
                          sum + (s.parameters || []).filter(p => p.parameterName && p.parameterName.trim()).length, 0
                        )}
                      </strong> Total Parameters
                    </span>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Form Footer */}
            <div className="sm-form-footer">
              <div className="sm-form-footer-left">
                <FormButton
                  variant="ghost"
                  icon={RefreshCw}
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </FormButton>
              </div>
              <div className="sm-form-footer-right">
                <FormButton
                  variant="outline"
                  icon={X}
                  onClick={() => navigate('/admin/sampling-master')}
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
                  {isEditing ? 'Update Plan' : 'Create Plan'}
                </FormButton>
              </div>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        <SuccessModal
          show={showSuccess}
          title={isEditing ? 'Plan Updated!' : 'Plan Created!'}
          message={`Quality plan "${formData.qcPlanNo}" has been ${isEditing ? 'updated' : 'created'} successfully.`}
          onClose={handleSuccessClose}
          onAction={!isEditing ? handleCreateAnother : undefined}
          actionLabel="Create Another"
        />
      </div>
    </div>
  );
};

export default QualityPlanConfigPage;
