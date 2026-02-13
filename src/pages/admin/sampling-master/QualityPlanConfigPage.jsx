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
  SAMPLING_API_CONFIG,
} from './api/samplingMasterApi';


import {
  validateQualityPlanForm,
  hasErrors,
  getInitialQualityPlanState,
  debounce,
} from './api/validation';


import './styles/SamplingMaster.css';

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
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);


  const [selectedDepartment, setSelectedDepartment] = useState(null);


  const [planNoValid, setPlanNoValid] = useState(false);
  const [planNoChecking, setPlanNoChecking] = useState(false);


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
  };

  const loadQualityPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetchQualityPlanById(id);
      if (response.success && response.data) {
        setFormData(response.data);
        setPlanNoValid(true);


        const dept = departments.find(d => d.id === response.data.departmentId);
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


  const handleSubmit = async (e) => {
    e.preventDefault();


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

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateQualityPlan(id, formData);
      } else {
        await createQualityPlan(formData);
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
              {}
              <FormSection
                icon={Hash}
                title="Plan Information"
                badge="Step 1 of 3"
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

              {}
              <FormSection
                icon={Package}
                title="Product Selection"
                badge="Step 2 of 3"
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

              {}
              <FormSection
                icon={Building2}
                title="Department Configuration"
                badge="Step 3 of 3"
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
