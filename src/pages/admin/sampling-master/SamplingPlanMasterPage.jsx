import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Target,
  Layers,
  Settings,
  Save,
  X,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Hash,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  Activity,
  BarChart3,
} from 'lucide-react';


import {
  FormInput,
  FormSection,
  PlanTypeSelector,
  IterationSelector,
  FormButton,
  SuccessModal,
  LoadingSpinner,
} from './components/FormComponents';


import {
  createSamplingPlan,
  updateSamplingPlan,
  fetchSamplingPlanById,
  validateSamplingPlanNo,
  calculateSampleQuantity,
  calculateRequiredPass,
  SAMPLING_API_CONFIG,
} from './api/samplingMasterApi';


import {
  validateSamplingPlanForm,
  hasErrors,
  getInitialSamplingPlanState,
  debounce,
} from './api/validation';


import './styles/SamplingMaster.css';


const PLAN_TYPE_OPTIONS = [
  {
    value: 'SP1',
    label: 'Level 1',
    icon: 'S1',
    description: 'Normal inspection level (default)',
  },
  {
    value: 'SP2',
    label: 'Level 2',
    icon: 'S2',
    description: 'Reduced inspection for proven quality',
  },
  {
    value: 'SP3',
    label: 'Level 3',
    icon: 'S3',
    description: '100% Inspection - Full lot sampling',
  },
];

const SamplingPlanMasterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);


  const [formData, setFormData] = useState(getInitialSamplingPlanState());
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [planNoValid, setPlanNoValid] = useState(false);
  const [planNoChecking, setPlanNoChecking] = useState(false);


  useEffect(() => {
    if (isEditing) {
      loadSamplingPlan();
    }
  }, [id]);

  const loadSamplingPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetchSamplingPlanById(id);
      console.log('[DEBUG loadSamplingPlan] Full response:', JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        console.log('[DEBUG loadSamplingPlan] samplePlanType from API:', response.data.samplePlanType);
        console.log('[DEBUG loadSamplingPlan] typeof samplePlanType:', typeof response.data.samplePlanType);
        console.log('[DEBUG loadSamplingPlan] iterations from API:', response.data.iterations);
        setFormData(response.data);
        setPlanNoValid(true);
      }
    } catch (error) {
      console.error('Failed to load sampling plan:', error);
      alert('Failed to load sampling plan');
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
        const result = await validateSamplingPlanNo(planNo, isEditing ? id : null);
        setPlanNoValid(result.isUnique);
        if (!result.isUnique) {
          setErrors(prev => ({ ...prev, samplePlanNo: 'This plan number already exists' }));
        } else {
          setErrors(prev => {
            const { samplePlanNo, ...rest } = prev;
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


    if (name === 'samplePlanNo') {
      setPlanNoValid(false);
      validatePlanNo(value);
    }


    if (name === 'samplePlanType') {
      recalculateSamples(value, formData.iterations);
    }


    if (name === 'iterations') {
      recalculateSamples(formData.samplePlanType, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const recalculateSamples = (planType, iterations) => {
    setFormData(prev => ({
      ...prev,
      lotRanges: prev.lotRanges.map(range => {

        if (planType === 'SP3') {
          const lotSize = range.lotMax;
          return {
            ...range,
            iteration1: lotSize,
            iteration2: lotSize,
            iteration3: lotSize,
            passRequired1: calculateRequiredPass(lotSize, 1),
            passRequired2: calculateRequiredPass(lotSize, 2),
            passRequired3: calculateRequiredPass(lotSize, 3),
          };
        }

        const avgLot = Math.floor((range.lotMin + range.lotMax) / 2);
        const iter1 = calculateSampleQuantity(avgLot, planType, 1);
        const iter2 = calculateSampleQuantity(avgLot, planType, 2);
        const iter3 = range.lotMax;

        return {
          ...range,
          iteration1: iter1,
          iteration2: iter2,
          iteration3: iter3,
          passRequired1: calculateRequiredPass(iter1, 1),
          passRequired2: calculateRequiredPass(iter2, 2),
          passRequired3: calculateRequiredPass(iter3, 3),
        };
      }),
    }));
  };


  const handleLotRangeChange = (index, field, value) => {
    setFormData(prev => {
      const newRanges = [...prev.lotRanges];
      newRanges[index] = { ...newRanges[index], [field]: Number(value) || 0 };


      if (field === 'lotMin' || field === 'lotMax') {
        const range = newRanges[index];


        if (prev.samplePlanType === 'SP3') {
          const lotSize = range.lotMax;
          newRanges[index].iteration1 = lotSize;
          newRanges[index].iteration2 = lotSize;
          newRanges[index].iteration3 = lotSize;
          newRanges[index].passRequired1 = calculateRequiredPass(lotSize, 1);
          newRanges[index].passRequired2 = calculateRequiredPass(lotSize, 2);
          newRanges[index].passRequired3 = calculateRequiredPass(lotSize, 3);
        } else {
          const avgLot = Math.floor((range.lotMin + range.lotMax) / 2);
          const iter1 = calculateSampleQuantity(avgLot, prev.samplePlanType, 1);
          const iter2 = calculateSampleQuantity(avgLot, prev.samplePlanType, 2);
          const iter3 = range.lotMax;

          newRanges[index].iteration1 = iter1;
          newRanges[index].iteration2 = iter2;
          newRanges[index].iteration3 = iter3;
          newRanges[index].passRequired1 = calculateRequiredPass(iter1, 1);
          newRanges[index].passRequired2 = calculateRequiredPass(iter2, 2);
          newRanges[index].passRequired3 = calculateRequiredPass(iter3, 3);
        }
      }
      return { ...prev, lotRanges: newRanges };
    });
  };

 const addLotRange = () => {
    const lastRange = formData.lotRanges[formData.lotRanges.length - 1];
    const newMin = (lastRange?.lotMax || 0) + 1;
    const newMax = newMin + 100;

    let iter1, iter2, iter3;


    if (formData.samplePlanType === 'SP3') {
      iter1 = newMax;
      iter2 = newMax;
      iter3 = newMax;
    } else {
      iter1 = calculateSampleQuantity(Math.floor((newMin + newMax) / 2), formData.samplePlanType, 1);
      iter2 = calculateSampleQuantity(Math.floor((newMin + newMax) / 2), formData.samplePlanType, 2);
      iter3 = newMax;
    }

    setFormData(prev => ({
      ...prev,
      lotRanges: [
        ...prev.lotRanges,
        {
          id: Date.now(),
          lotMin: newMin,
          lotMax: newMax,
          iteration1: iter1,
          iteration2: iter2,
          iteration3: iter3,
          passRequired1: calculateRequiredPass(iter1, 1),
          passRequired2: calculateRequiredPass(iter2, 2),
          passRequired3: calculateRequiredPass(iter3, 3),
        },
      ],
    }));
  };

  const removeLotRange = (index) => {
    if (formData.lotRanges.length <= 1) {
      alert('At least one lot range is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      lotRanges: prev.lotRanges.filter((_, i) => i !== index),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationErrors = validateSamplingPlanForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }


    if (!planNoValid && !isEditing) {
      setErrors(prev => ({ ...prev, samplePlanNo: 'Please enter a unique plan number' }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateSamplingPlan(id, formData);
      } else {
        await createSamplingPlan(formData);
      }
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} sampling plan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData(getInitialSamplingPlanState());
      setErrors({});
      setTouched({});
      setPlanNoValid(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/admin/sampling-master');
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setFormData(getInitialSamplingPlanState());
    setErrors({});
    setTouched({});
    setPlanNoValid(false);
  };


  if (isLoading) {
    return (
      <div className="sm-page">
        <div className="sm-content">
          <LoadingSpinner message="Loading sampling plan..." />
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
              <Target size={28} />
            </div>
            <div>
              <h1 className="sm-page-title">
                {isEditing ? 'Edit Sampling Plan' : 'Create Sampling Plan'}
              </h1>
              <p className="sm-page-subtitle">
                Define sampling rules and inspection levels
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
                    <BarChart3 size={36} />
                  </div>
                  <div>
                    <h2 className="sm-form-title">Sampling Plan Master</h2>
                    <p className="sm-form-subtitle">
                      Configure inspection sampling levels per AQL standards
                    </p>
                    <div className="sm-form-badge">
                      <Shield size={14} />
                      ISO 2859-1 Compliant
                    </div>
                  </div>
                </div>
                <div className="sm-form-header-stats">
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value">{formData.lotRanges.length}</div>
                    <div className="sm-header-stat-label">Lot Ranges</div>
                  </div>
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value">{formData.iterations}</div>
                    <div className="sm-header-stat-label">Iterations</div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="sm-form-body">
              {}
              <FormSection
                icon={Hash}
                title="Basic Information"
                badge="Step 1 of 3"
              >
                <div className="sm-form-grid sm-form-grid-2">
                  <FormInput
                    label="Sample Plan Number"
                    name="samplePlanNo"
                    value={formData.samplePlanNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., SP-001"
                    required
                    error={touched.samplePlanNo && errors.samplePlanNo}
                    success={planNoValid && !errors.samplePlanNo}
                    helper={planNoChecking ? 'Checking availability...' : planNoValid ? 'Plan number is available!' : null}
                    icon={Hash}
                    maxLength={20}
                  />
                </div>
              </FormSection>

              {}
              <FormSection
                icon={Layers}
                title="Sampling Plan Type"
                badge="Step 2 of 3"
              >
                <PlanTypeSelector
                  value={formData.samplePlanType}
                  onChange={handleChange}
                  options={PLAN_TYPE_OPTIONS}
                />

                <div style={{ marginTop: '32px' }}>
                  <label className="sm-label" style={{ marginBottom: '16px', display: 'block' }}>
                    Number of Iterations
                    <span className="sm-label-required">*</span>
                  </label>
                  <IterationSelector
                    value={formData.iterations}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>

              {}
              <FormSection
                icon={Settings}
                title="Lot Range Configuration"
                badge="Step 3 of 3"
              >
                <div className="sm-lot-range-section">
                  <div className="sm-lot-range-header">
                    <div className="sm-lot-range-title">
                      <div className="sm-lot-range-title-icon">
                        <Activity size={18} />
                      </div>
                      Sample Size Configuration
                    </div>
                    <FormButton
                      variant="outline"
                      icon={Plus}
                      onClick={addLotRange}
                      type="button"
                    >
                      Add Range
                    </FormButton>
                  </div>

                  <table className="sm-lot-range-table">
                    <thead>
                      <tr>
                        <th>Lot Range</th>
                        <th>Iter 1 Sample</th>
                        <th>Iter 1 Pass</th>
                        {formData.iterations >= 2 && <th>Iter 2 Sample</th>}
                        {formData.iterations >= 2 && <th>Iter 2 Pass</th>}
                        {formData.iterations >= 3 && <th>Iter 3 (100%)</th>}
                        {formData.iterations >= 3 && <th>Iter 3 Pass</th>}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lotRanges.map((range, index) => (
                        <tr key={range.id || index}>
                          <td>
                            <div className="sm-lot-range-range">
                              <input
                                type="number"
                                className="sm-lot-range-input"
                                value={range.lotMin}
                                onChange={(e) => handleLotRangeChange(index, 'lotMin', e.target.value)}
                                min={1}
                                placeholder="Min"
                              />
                              <span className="sm-lot-range-separator">—</span>
                              <input
                                type="number"
                                className="sm-lot-range-input"
                                value={range.lotMax}
                                onChange={(e) => handleLotRangeChange(index, 'lotMax', e.target.value)}
                                min={range.lotMin || 1}
                                placeholder="Max"
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="sm-lot-range-input"
                              value={range.iteration1}
                              onChange={(e) => handleLotRangeChange(index, 'iteration1', e.target.value)}
                              min={1}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="sm-lot-range-input"
                              value={range.passRequired1}
                              onChange={(e) => handleLotRangeChange(index, 'passRequired1', e.target.value)}
                              min={1}
                              max={range.iteration1}
                            />
                          </td>
                          {formData.iterations >= 2 && (
                            <>
                              <td>
                                <input
                                  type="number"
                                  className="sm-lot-range-input"
                                  value={range.iteration2}
                                  onChange={(e) => handleLotRangeChange(index, 'iteration2', e.target.value)}
                                  min={1}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="sm-lot-range-input"
                                  value={range.passRequired2}
                                  onChange={(e) => handleLotRangeChange(index, 'passRequired2', e.target.value)}
                                  min={1}
                                  max={range.iteration2}
                                />
                              </td>
                            </>
                          )}
                          {formData.iterations >= 3 && (
                            <>
                              <td>
                                <input
                                  type="number"
                                  className={`sm-lot-range-input sm-disabled`}
                                  value={range.iteration3}
                                  readOnly
                                  title="100% inspection"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="sm-lot-range-input"
                                  value={range.passRequired3}
                                  onChange={(e) => handleLotRangeChange(index, 'passRequired3', e.target.value)}
                                  min={1}
                                  max={range.iteration3}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <button
                              type="button"
                              className="sm-lot-range-delete"
                              onClick={() => removeLotRange(index)}
                              title="Remove range"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {errors.lotRanges && typeof errors.lotRanges === 'string' && (
                    <span className="sm-error-text" style={{ marginTop: '12px' }}>
                      {errors.lotRanges}
                    </span>
                  )}
                </div>
              </FormSection>
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
          message={`Sampling plan "${formData.samplePlanNo}" has been ${isEditing ? 'updated' : 'created'} successfully.`}
          onClose={handleSuccessClose}
          onAction={!isEditing ? handleCreateAnother : undefined}
          actionLabel="Create Another"
        />
      </div>
    </div>
  );
};

export default SamplingPlanMasterPage;
