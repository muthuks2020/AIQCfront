// src/pages/admin/sampling-master/QualityPlanConfigPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
  FileText,
  Building2,
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
  fetchCompanies,
  fetchCityLocations,
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

  // ── Form state ──
  const [formData, setFormData] = useState(() => ({
    ...getInitialQualityPlanState(),
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Master data ──
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [cityLocations, setCityLocations] = useState([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCityLocations, setLoadingCityLocations] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [planNoValid, setPlanNoValid] = useState(false);
  const [planNoChecking, setPlanNoChecking] = useState(false);


  // ═══════════════════════════════════════════════════════════════
  // Load master data on mount
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => { loadMasterData(); }, []);
  useEffect(() => { if (isEditing) loadQualityPlan(); }, [id]);

  const loadMasterData = async () => {
    // Departments — existing qc_departments (5 rows)
    setLoadingDepartments(true);
    try {
      const resp = await fetchDepartments();
      if (resp.success) setDepartments(resp.data || []);
    } catch (e) { console.error('Failed to load departments:', e); }
    finally { setLoadingDepartments(false); }

    // Products — existing qc_product_categories
    setLoadingProducts(true);
    try {
      const resp = await fetchProducts();
      if (resp.success) setProducts(resp.data || []);
    } catch (e) { console.error('Failed to load products:', e); }
    finally { setLoadingProducts(false); }

    // Companies — new qc_companies table
    setLoadingCompanies(true);
    try {
      const resp = await fetchCompanies();
      if (resp.success) setCompanies(resp.data || []);
    } catch (e) { console.error('Failed to load companies:', e); }
    finally { setLoadingCompanies(false); }

    // City Locations — existing qc_locations filtered by location_type='city'
    setLoadingCityLocations(true);
    try {
      const resp = await fetchCityLocations();
      if (resp.success) setCityLocations(resp.data || []);
    } catch (e) { console.error('Failed to load city locations:', e); }
    finally { setLoadingCityLocations(false); }
  };

  const loadQualityPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetchQualityPlanById(id);
      if (response.success && response.data) {
        const data = { ...response.data };
        setFormData(data);
        setPlanNoValid(true);
        const dept = departments.find(d => d.id === data.departmentId);
        setSelectedDepartment(dept);
      }
    } catch (error) {
      console.error('Failed to load quality plan:', error);
      alert('Failed to load quality plan');
      navigate('/admin/sampling-master');
    } finally { setIsLoading(false); }
  };


  // ═══════════════════════════════════════════════════════════════
  // Plan number uniqueness check
  // ═══════════════════════════════════════════════════════════════
  const validatePlanNo = useCallback(
    debounce(async (planNo) => {
      if (!planNo || planNo.length < 2) { setPlanNoValid(false); return; }
      setPlanNoChecking(true);
      try {
        const result = await validateQCPlanNo(planNo, isEditing ? id : null);
        setPlanNoValid(result.isUnique);
        if (!result.isUnique) {
          setErrors(prev => ({ ...prev, qcPlanNo: 'This plan number already exists' }));
        } else {
          setErrors(prev => { const { qcPlanNo, ...rest } = prev; return rest; });
        }
      } catch (error) { console.error('Validation error:', error); }
      finally { setPlanNoChecking(false); }
    }, 500),
    [isEditing, id]
  );


  // ═══════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const { [name]: removed, ...rest } = prev; return rest; });
    }
    if (name === 'qcPlanNo') { setPlanNoValid(false); validatePlanNo(value); }
    if (name === 'departmentId') {
      const dept = departments.find(d => d.id === value);
      setSelectedDepartment(dept);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Company and Location store the text NAME because
  // qc_plans.company and qc_plans.location are VARCHAR(200) columns
  const handleCompanyChange = (e) => {
    const selectedName = e.target.value;
    setFormData(prev => ({ ...prev, company: selectedName }));
    if (errors.company) setErrors(prev => { const { company, ...rest } = prev; return rest; });
  };

  const handleLocationChange = (e) => {
    const selectedName = e.target.value;
    setFormData(prev => ({ ...prev, location: selectedName }));
    if (errors.location) setErrors(prev => { const { location, ...rest } = prev; return rest; });
  };


  // ═══════════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════════
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
      const cleanedFormData = { ...formData, stages: [] };
      if (isEditing) { await updateQualityPlan(id, cleanedFormData); }
      else { await createQualityPlan(cleanedFormData); }
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} quality plan: ${error.message}`);
    } finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData({ ...getInitialQualityPlanState() });
      setErrors({}); setTouched({}); setPlanNoValid(false); setSelectedDepartment(null);
    }
  };

  const handleSuccessClose = () => { setShowSuccess(false); navigate('/admin/sampling-master'); };
  const handleCreateAnother = () => {
    setShowSuccess(false);
    setFormData({ ...getInitialQualityPlanState() });
    setErrors({}); setTouched({}); setPlanNoValid(false); setSelectedDepartment(null);
  };


  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="sm-page"><div className="sm-content">
        <LoadingSpinner message="Loading quality plan..." />
      </div></div>
    );
  }

  return (
    <div className="sm-page">
      <div className="sm-content" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px' }}>

        {/* ─── Page Header ────────────────────────────────────── */}
        <div className="sm-page-header" style={{ marginBottom: '12px', padding: '12px 0' }}>
          <div className="sm-page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="sm-back-btn" onClick={() => navigate('/admin/sampling-master')}
              title="Back to list" style={{ padding: '6px' }}>
              <ArrowLeft size={18} />
            </button>
            <div className="sm-page-icon" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="sm-page-title" style={{ fontSize: '18px', margin: 0 }}>
                {isEditing ? 'Edit Quality Plan' : 'Create Quality Plan'}
              </h1>
              <p className="sm-page-subtitle" style={{ fontSize: '12px', margin: '2px 0 0', opacity: 0.7 }}>
                Define QC plan with company, location and department mapping
              </p>
            </div>
          </div>
          <div className="sm-page-header-right">
            {SAMPLING_API_CONFIG.useMockData && (
              <span style={{ padding: '4px 10px', background: '#FEF3C7', color: '#D97706',
                borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Mock Mode</span>
            )}
          </div>
        </div>


        {/* ─── Form ───────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="sm-form-container" style={{ gap: '0' }}>

            {/* Form Header */}
            <div className="sm-form-header" style={{ padding: '16px 20px' }}>
              <div className="sm-form-header-content">
                <div className="sm-form-header-left" style={{ gap: '12px' }}>
                  <div className="sm-form-icon-large" style={{ width: '44px', height: '44px' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="sm-form-title" style={{ fontSize: '16px', margin: 0 }}>
                      Quality Plan Configuration
                    </h2>
                    <p className="sm-form-subtitle" style={{ fontSize: '12px', margin: '2px 0 0' }}>
                      Define QC parameters for products with department mapping
                    </p>
                    <div className="sm-form-badge" style={{ marginTop: '4px', padding: '2px 8px', fontSize: '10px' }}>
                      <Shield size={10} /> ISO 9001 Compliant
                    </div>
                  </div>
                </div>
                <div className="sm-form-header-stats" style={{ gap: '16px' }}>
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value" style={{ fontSize: '18px' }}>{companies.length}</div>
                    <div className="sm-header-stat-label" style={{ fontSize: '10px' }}>Companies</div>
                  </div>
                  <div className="sm-header-stat">
                    <div className="sm-header-stat-value" style={{ fontSize: '18px' }}>{departments.length}</div>
                    <div className="sm-header-stat-label" style={{ fontSize: '10px' }}>Departments</div>
                  </div>
                </div>
              </div>
            </div>


            {/* Form Body */}
            <div className="sm-form-body" style={{ padding: '16px 20px', gap: '16px' }}>

              {/* ═══ Step 1: Plan Information ═══════════════════ */}
              <FormSection icon={Hash} title="Plan Information" badge="Step 1 of 3">
                <div className="sm-form-grid sm-form-grid-2">
                  <FormInput
                    label="QC Plan Number" name="qcPlanNo" value={formData.qcPlanNo}
                    onChange={handleChange} onBlur={handleBlur} placeholder="e.g., RD.7.3-07"
                    required error={touched.qcPlanNo && errors.qcPlanNo}
                    success={planNoValid && !errors.qcPlanNo}
                    helper={planNoChecking ? 'Checking availability...' : planNoValid ? 'Plan number is available!' : null}
                    icon={Hash} maxLength={50}
                  />
                  <FormInput
                    label="Plan Name" name="planName" value={formData.planName}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g., B-SCAN Transducer QC Plan"
                    required error={touched.planName && errors.planName} icon={FileText}
                  />
                </div>
                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '12px' }}>
                  <FormInput
                    label="Document / Revision No" name="documentRevNo" value={formData.documentRevNo}
                    onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Rev-03"
                    error={touched.documentRevNo && errors.documentRevNo} icon={Link2}
                  />
                  <FormInput
                    label="Effective Date" name="effectiveDate" type="date" value={formData.effectiveDate}
                    onChange={handleChange} onBlur={handleBlur} required
                    error={touched.effectiveDate && errors.effectiveDate} icon={Calendar}
                  />
                </div>
                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '12px' }}>
                  <FormInput
                    label="Revision Date" name="revisionDate" type="date" value={formData.revisionDate}
                    onChange={handleChange} onBlur={handleBlur}
                    error={touched.revisionDate && errors.revisionDate} icon={Calendar}
                  />
                  <div />
                </div>
              </FormSection>


              {/* ═══ Step 2: Company, Location & Department ════ */}
              <FormSection icon={Building2} title="Company, Location & Department" badge="Step 2 of 3">

                {/* Row 1: Company + Location */}
                <div className="sm-form-grid sm-form-grid-2">
                  <FormSelect
                    label="Company" name="company"
                    value={formData.company}
                    onChange={handleCompanyChange}
                    onBlur={handleBlur}
                    options={companies.map(c => ({ id: c.name, name: c.name }))}
                    placeholder="Select company"
                    required loading={loadingCompanies}
                    error={touched.company && errors.company}
                  />
                  <FormSelect
                    label="Location" name="location"
                    value={formData.location}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    options={cityLocations.map(l => ({ id: l.name, name: l.name }))}
                    placeholder="Select location"
                    required loading={loadingCityLocations}
                    error={touched.location && errors.location}
                  />
                </div>

                {/* Row 2: Department + Product Category */}
                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '12px' }}>
                  <FormSelect
                    label="Department" name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={departments.map(d => ({ id: d.id, name: `${d.code} - ${d.name}` }))}
                    placeholder="Select department"
                    required loading={loadingDepartments}
                    error={touched.departmentId && errors.departmentId}
                  />
                  <FormSelect
                    label="Product Category" name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={products.map(p => ({ id: p.id, name: p.name }))}
                    placeholder="Select product category"
                    loading={loadingProducts}
                    error={touched.productId && errors.productId}
                  />
                </div>

                {/* Department Info panel */}
                {selectedDepartment && (
                  <div style={{ marginTop: '12px' }}>
                    <DepartmentInfo department={selectedDepartment} />
                  </div>
                )}
              </FormSection>


              {/* ═══ Step 3: Description ═══════════════════════ */}
              <FormSection icon={FileText} title="Additional Details" badge="Step 3 of 3">
                <div className="sm-field">
                  <label className="sm-label" htmlFor="description">
                    Description <span className="sm-label-optional">(Optional)</span>
                  </label>
                  <textarea
                    id="description" name="description" value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of this quality plan..."
                    className="sm-input" rows={3}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
              </FormSection>

            </div>


            {/* Form Footer */}
            <div className="sm-form-footer" style={{ padding: '12px 20px' }}>
              <div className="sm-form-footer-left">
                <FormButton variant="ghost" icon={RefreshCw} onClick={handleReset} type="button">
                  Reset
                </FormButton>
              </div>
              <div className="sm-form-footer-right">
                <FormButton variant="outline" icon={X}
                  onClick={() => navigate('/admin/sampling-master')} type="button">
                  Cancel
                </FormButton>
                <FormButton variant="primary" icon={Save} type="submit" loading={isSubmitting}>
                  {isEditing ? 'Update Plan' : 'Create Plan'}
                </FormButton>
              </div>
            </div>
          </div>
        </form>


        {/* ─── Success Modal ──────────────────────────────────── */}
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
