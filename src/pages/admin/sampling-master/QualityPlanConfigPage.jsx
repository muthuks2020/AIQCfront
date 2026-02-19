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
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';


import {
  FormInput,
  FormSelect,
  FormSection,
  FormButton,
  SuccessModal,
  LoadingSpinner,
  DepartmentInfo,
} from './components/FormComponents';


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


import {
  validateQualityPlanForm,
  hasErrors,
  getInitialQualityPlanState,
  debounce,
} from './api/validation';


import './styles/SamplingMaster.css';


// ─── Default stage / parameter creators ──────────────────────────────────────
const _uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createDefaultParameter = (seq = 1) => ({
  _key: `p-${_uid()}`,
  parameterName: '',
  parameterSequence: seq,
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

const createDefaultStage = (seq = 1) => ({
  _key: `s-${_uid()}`,
  stageName: '',
  stageType: 'visual',
  stageSequence: seq,
  inspectionType: 'sampling',
  samplingPlanId: '',
  isMandatory: true,
  requiresInstrument: false,
  parameters: [createDefaultParameter(1)],
});


// ─── Dropdown options ────────────────────────────────────────────────────────
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


// ═════════════════════════════════════════════════════════════════════════════
// ParameterRow — one row inside a stage card
// ═════════════════════════════════════════════════════════════════════════════
const ParameterRow = ({ param, index, onChange, onRemove, canRemove }) => {
  const up = (field, value) => onChange(index, { ...param, [field]: value });

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 140px 1fr 120px 60px', gap: 10,
      alignItems: 'start', padding: '12px 16px',
      background: index % 2 === 0 ? '#FFF' : '#FAFBFC', borderBottom: '1px solid #F1F5F9',
    }}>
      <input type="text" value={param.parameterName || ''} onChange={e => up('parameterName', e.target.value)}
        placeholder="e.g., Surface finish" className="sm-input" style={{ fontSize: 13, padding: '8px 12px' }} />
      <select value={param.checkingType || 'visual'} onChange={e => up('checkingType', e.target.value)}
        className="sm-select" style={{ fontSize: 13, padding: '8px 10px' }}>
        {CHECKING_TYPES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="text" value={param.specification || ''} onChange={e => up('specification', e.target.value)}
        placeholder="e.g., No scratches" className="sm-input" style={{ fontSize: 13, padding: '8px 12px' }} />
      <select value={param.inputType || 'pass_fail'} onChange={e => up('inputType', e.target.value)}
        className="sm-select" style={{ fontSize: 13, padding: '8px 10px' }}>
        {INPUT_TYPES.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button type="button" onClick={() => onRemove(index)} disabled={!canRemove}
          style={{
            width: 32, height: 32, borderRadius: 6, border: 'none',
            background: canRemove ? '#FEE2E2' : '#F1F5F9', color: canRemove ? '#DC2626' : '#94A3B8',
            cursor: canRemove ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};


// ═════════════════════════════════════════════════════════════════════════════
// StageCard — collapsible card with stage config + parameter rows
// ═════════════════════════════════════════════════════════════════════════════
const StageCard = ({ stage, stageIndex, onChange, onRemove, canRemove, samplingPlans, stageErrors }) => {
  const [expanded, setExpanded] = useState(true);

  const setField = (field, value) => onChange(stageIndex, { ...stage, [field]: value });

  const onParamChange = (pi, updatedParam) => {
    const np = [...stage.parameters];
    np[pi] = updatedParam;
    onChange(stageIndex, { ...stage, parameters: np });
  };
  const addParam = () => {
    const nextSeq = stage.parameters.length + 1;
    onChange(stageIndex, { ...stage, parameters: [...stage.parameters, createDefaultParameter(nextSeq)] });
  };
  const removeParam = (pi) => {
    if (stage.parameters.length <= 1) return;
    const np = stage.parameters.filter((_, i) => i !== pi).map((p, i) => ({ ...p, parameterSequence: i + 1 }));
    onChange(stageIndex, { ...stage, parameters: np });
  };

  const hasErr = stageErrors && Object.keys(stageErrors).length > 0;

  return (
    <div style={{ border: `1px solid ${hasErr ? '#FCA5A5' : '#E2E8F0'}`, borderRadius: 10, overflow: 'hidden', background: '#FFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: hasErr ? '#FEF2F2' : '#F8FAFC',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none', cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: hasErr ? '#DC2626' : '#003366',
            color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>{stageIndex + 1}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>{stage.stageName || `Stage ${stageIndex + 1}`}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {STAGE_TYPES.find(t => t.id === stage.stageType)?.name || 'Visual'} &middot; {stage.parameters.length} param{stage.parameters.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canRemove && (
            <button type="button" onClick={e => { e.stopPropagation(); onRemove(stageIndex); }}
              style={{
                padding: '6px 10px', borderRadius: 6, border: '1px solid #FCA5A5',
                background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 12,
                fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <Trash2 size={12} /> Remove
            </button>
          )}
          {expanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </div>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div style={{ padding: 20 }}>
          {/* Stage config row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="sm-field">
              <label className="sm-label">Stage Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="text" value={stage.stageName} onChange={e => setField('stageName', e.target.value)}
                placeholder="e.g., Visual Inspection" className="sm-input"
                style={{ borderColor: stageErrors?.stageName ? '#FCA5A5' : undefined }} />
              {stageErrors?.stageName && <span className="sm-error-text" style={{ marginTop: 4, fontSize: 11 }}>{stageErrors.stageName}</span>}
            </div>
            <div className="sm-field">
              <label className="sm-label">Stage Type</label>
              <select value={stage.stageType} onChange={e => setField('stageType', e.target.value)} className="sm-select">
                {STAGE_TYPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm-field">
              <label className="sm-label">Inspection Type</label>
              <select value={stage.inspectionType} onChange={e => setField('inspectionType', e.target.value)} className="sm-select">
                {INSPECTION_TYPES.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="sm-field">
              <label className="sm-label">Sampling Plan</label>
              <select
                value={stage.samplingPlanId || ''}
                onChange={e => setField('samplingPlanId', e.target.value ? Number(e.target.value) : '')}
                className="sm-select"
                disabled={stage.inspectionType === '100_percent'}
              >
                <option value="">Select plan</option>
                {samplingPlans.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.samplePlanNo || sp.plan_code} - {sp.samplePlanName || sp.plan_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parameters table */}
          <div style={{ border: '1px solid #E8ECF0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: '#F0F7FF', borderBottom: '1px solid #E8ECF0',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#003366' }}>Parameters ({stage.parameters.length})</div>
              <button type="button" onClick={addParam}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid #003366',
                  background: 'transparent', color: '#003366', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                <Plus size={14} /> Add
              </button>
            </div>
            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 1fr 120px 60px', gap: 10,
              padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #E8ECF0',
              fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <div>Parameter Name *</div><div>Checking Type</div><div>Specification</div><div>Input Type</div><div></div>
            </div>
            {/* Rows */}
            <div>
              {stage.parameters.map((p, pi) => (
                <ParameterRow key={p._key || p.id || pi} param={p} index={pi}
                  onChange={onParamChange} onRemove={removeParam} canRemove={stage.parameters.length > 1} />
              ))}
            </div>
            {stageErrors?.parameters && (
              <div style={{ padding: '8px 16px 12px', color: '#DC2626', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} />{stageErrors.parameters}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ═════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ═════════════════════════════════════════════════════════════════════════════
const QualityPlanConfigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);


  const [formData, setFormData] = useState(getInitialQualityPlanState());
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [samplingPlans, setSamplingPlans] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);


  const [selectedDepartment, setSelectedDepartment] = useState(null);


  const [planNoValid, setPlanNoValid] = useState(false);
  const [planNoChecking, setPlanNoChecking] = useState(false);

  // Stage-level validation errors
  const [stageErrors, setStageErrors] = useState([]);


  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (isEditing) {
      loadQualityPlan();
    }
  }, [id]);

  const loadMasterData = async () => {

    setLoadingDepartments(true);
    try {
      const deptResponse = await fetchDepartments();
      if (deptResponse.success) {
        setDepartments(deptResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoadingDepartments(false);
    }


    setLoadingProducts(true);
    try {
      const prodResponse = await fetchProducts();
      if (prodResponse.success) {
        setProducts(prodResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }

    // Sampling Plans (for stage dropdowns)
    try {
      const spResponse = await fetchSamplingPlans();
      if (spResponse.success) {
        setSamplingPlans(spResponse.data || []);
      }
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
        // Ensure stages have _key for React list rendering
        if (data.stages && data.stages.length > 0) {
          data.stages = data.stages.map(s => ({
            ...s,
            _key: s._key || `s-${_uid()}`,
            parameters: (s.parameters || []).map(p => ({
              ...p,
              _key: p._key || `p-${_uid()}`,
            })),
          }));
        } else {
          // No stages from server — give a blank one to start with
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
    // Clear error for this stage
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


  // ─── Stage Validation ──────────────────────────────────────────────────
  const validateStages = () => {
    const stages = formData.stages || [];
    const errs = [];
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
      errs.push(stageErr);
    });

    return { valid: !hasError, errors: errs };
  };


  // ─── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate top-level form fields
    const validationErrors = validateQualityPlanForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    // 2. Validate plan number uniqueness
    if (!planNoValid && !isEditing) {
      setErrors(prev => ({ ...prev, qcPlanNo: 'Please enter a unique plan number' }));
      return;
    }

    // 3. Validate stages
    const stageValidation = validateStages();
    if (!stageValidation.valid) {
      setStageErrors(stageValidation.errors);
      document.getElementById('stages-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // 4. Submit
    setIsSubmitting(true);
    try {
      // Clean up stages — strip empty params, assign sequences
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


  if (isLoading) {
    return (
      <div className="sm-page">
        <div className="sm-content">
          <LoadingSpinner message="Loading quality plan..." />
        </div>
      </div>
    );
  }

  return (
    <div className="sm-page">
      <div className="sm-content">
        {}
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

        {}
        <form onSubmit={handleSubmit}>
          <div className="sm-form-container">
            {}
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

            {}
            <div className="sm-form-body">

              {/* ─── Step 1: Plan Information ─────────────────────────── */}
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
                </div>

                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '24px' }}>
                  <FormInput
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Appasamy Associates Pvt Ltd"
                    required
                    error={touched.company && errors.company}
                    icon={Building2}
                    maxLength={200}
                  />

                  <FormInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Chennai Plant"
                    required
                    error={touched.location && errors.location}
                    icon={Building2}
                    maxLength={200}
                  />
                </div>

                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '24px' }}>
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

              {/* ─── Step 2: Product Selection ────────────────────────── */}
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

              {/* ─── Step 3: Department Configuration ─────────────────── */}
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

                {}
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

              {/* ─── Step 4: Inspection Stages & Parameters ──────────── */}
              <div id="stages-section">
                <FormSection
                  icon={Layers}
                  title="Inspection Stages & Parameters"
                  badge="Step 4 of 4"
                >
                  {/* Info banner */}
                  <div style={{
                    padding: '10px 14px', background: '#FFFBEB', borderRadius: 8,
                    border: '1px solid #FDE68A', fontSize: 13, color: '#92400E',
                    marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <AlertCircle size={16} />
                    <span>
                      Define at least one stage with parameters.
                      Each stage represents an inspection step (e.g., Visual, Functional, Dimensional).
                    </span>
                  </div>

                  {/* Stage Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                  {/* Add Stage button */}
                  <button
                    type="button"
                    onClick={handleAddStage}
                    style={{
                      marginTop: 16, width: '100%', padding: 14, borderRadius: 10,
                      border: '2px dashed #CBD5E1', background: '#FAFBFC', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 8, color: '#003366', fontSize: 14, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#003366'; e.currentTarget.style.background = '#F0F7FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FAFBFC'; }}
                  >
                    <Plus size={18} />
                    Add Another Stage
                  </button>

                  {/* Summary bar */}
                  <div style={{
                    marginTop: 16, padding: '12px 16px', background: '#F8FAFC',
                    borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex',
                    gap: 24, fontSize: 13, color: '#475569',
                  }}>
                    <span>
                      <strong>{(formData.stages || []).length}</strong>{' '}
                      Stage{(formData.stages || []).length !== 1 ? 's' : ''}
                    </span>
                    <span>
                      <strong>
                        {(formData.stages || []).reduce(
                          (sum, s) => sum + (s.parameters || []).filter(p => p.parameterName && p.parameterName.trim()).length, 0
                        )}
                      </strong>{' '}
                      Total Parameters
                    </span>
                  </div>
                </FormSection>
              </div>

            </div>

            {}
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

        {}
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

