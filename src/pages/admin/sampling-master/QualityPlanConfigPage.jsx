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
  Package,
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

  // ── Cascade IDs (used for filtered fetching only, not submitted to API) ──
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');


  // ═══════════════════════════════════════════════════════════════
  // Load master data on mount
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => { loadMasterData(); }, []);
  useEffect(() => { if (isEditing) loadQualityPlan(); }, [id]);

  const loadMasterData = async () => {
    // Only companies load on mount — locations/departments/products cascade from user selections
    setLoadingCompanies(true);
    try {
      const resp = await fetchCompanies();
      if (resp.success) setCompanies(resp.data || []);
    } catch (e) { console.error('Failed to load companies:', e); }
    finally { setLoadingCompanies(false); }
  };

  const loadQualityPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetchQualityPlanById(id);
      if (!response.success || !response.data) return;
      const data = { ...response.data };
      setFormData(data);
      setPlanNoValid(true);

      // ── Walk the cascade chain to populate all dependent dropdowns ──

      // Step 1: companies already loaded in loadMasterData
      //         find the company whose name matches data.company
      const companiesResp = await fetchCompanies();
      const allCompanies = companiesResp.data || [];
      setCompanies(allCompanies);
      const matchedCompany = allCompanies.find(
        c => c.name === data.company
      );
      if (!matchedCompany) return;
      setSelectedCompanyId(String(matchedCompany.id));

      // Step 2: fetch locations for that company
      const locResp = await fetchCityLocations(matchedCompany.id);
      const allLocations = locResp.data || [];
      setCityLocations(allLocations);
      const matchedLocation = allLocations.find(
        l => l.name === data.location
      );
      if (!matchedLocation) return;
      setSelectedLocationId(String(matchedLocation.id));

      // Step 3: fetch departments for that location
      const deptResp = await fetchDepartments(matchedLocation.id);
      const allDepts = deptResp.data || [];
      setDepartments(allDepts);
      const matchedDept = allDepts.find(
        d => String(d.id) === String(data.departmentId)
      );
      setSelectedDepartment(matchedDept || null);
      if (!data.departmentId) return;

      // Step 4: fetch products for that department
      const prodResp = await fetchProducts(data.departmentId);
      setProducts(prodResp.data || []);

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
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ── Company → fetch filtered locations, reset all downstream ──
  const handleCompanyChange = async (e) => {
    const companyId = e.target.value;
    const selected = companies.find(c => String(c.id) === String(companyId));
    setSelectedCompanyId(companyId);
    setSelectedLocationId('');
    setSelectedDepartment(null);
    setCityLocations([]);
    setDepartments([]);
    setProducts([]);
    setFormData(prev => ({ ...prev, company: selected?.name || '', location: '', departmentId: '', productId: [] }));
    if (errors.company) setErrors(prev => { const { company, ...rest } = prev; return rest; });
    if (!companyId) return;
    setLoadingCityLocations(true);
    try {
      const resp = await fetchCityLocations(companyId);
      if (resp.success) setCityLocations(resp.data || []);
    } catch (e) { console.error('Failed to load locations:', e); }
    finally { setLoadingCityLocations(false); }
  };

  // ── Location → fetch filtered departments, reset downstream ──
  const handleLocationChange = async (e) => {
    const locationId = e.target.value;
    const selected = cityLocations.find(l => String(l.id) === String(locationId));
    setSelectedLocationId(locationId);
    setSelectedDepartment(null);
    setDepartments([]);
    setProducts([]);
    setFormData(prev => ({ ...prev, location: selected?.name || '', departmentId: '', productId: [] }));
    if (errors.location) setErrors(prev => { const { location, ...rest } = prev; return rest; });
    if (!locationId) return;
    setLoadingDepartments(true);
    try {
      const resp = await fetchDepartments(locationId);
      if (resp.success) setDepartments(resp.data || []);
    } catch (e) { console.error('Failed to load departments:', e); }
    finally { setLoadingDepartments(false); }
  };

  // ── Department → fetch filtered products, reset product ──
  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    const dept = departments.find(d => String(d.id) === String(departmentId));
    setSelectedDepartment(dept || null);
    setProducts([]);
    setFormData(prev => ({ ...prev, departmentId, productId: [] }));
    if (errors.departmentId) setErrors(prev => { const { departmentId: _, ...rest } = prev; return rest; });
    if (!departmentId) return;
    setLoadingProducts(true);
    try {
      const resp = await fetchProducts(departmentId);
      if (resp.success) setProducts(resp.data || []);
    } catch (e) { console.error('Failed to load products:', e); }
    finally { setLoadingProducts(false); }
  };

  // ── Product multi-select ──
  const handleProductChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData(prev => ({ ...prev, productId: selectedIds }));
    if (errors.productId) setErrors(prev => { const { productId: _, ...rest } = prev; return rest; });
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
      setFormData(getInitialQualityPlanState());
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
    setFormData(getInitialQualityPlanState());
    setErrors({});
    setTouched({});
    setPlanNoValid(false);
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
        {/* ─── Page Header ────────────────────────────────────── */}
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
                  <div />
                </div>
                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '12px' }}>
                  <FormInput
                    label="Effective Date" name="effectiveDate" type="date" value={formData.effectiveDate}
                    onChange={handleChange} onBlur={handleBlur} required
                    error={touched.effectiveDate && errors.effectiveDate} icon={Calendar}
                  />
                  <FormInput
                    label="Revision Date" name="revisionDate" type="date" value={formData.revisionDate}
                    onChange={handleChange} onBlur={handleBlur}
                    error={touched.revisionDate && errors.revisionDate} icon={Calendar}
                  />
                </div>
              </FormSection>


              {/* ═══ Step 2: Company, Location & Department ════ */}
              <FormSection icon={Building2} title="Company, Location & Department" badge="Step 2 of 3">

                {/* Row 1: Company + Location */}
                <div className="sm-form-grid sm-form-grid-2">
                  <FormSelect
                    label="Company" name="company"
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    onBlur={handleBlur}
                    options={companies.map(c => ({ id: c.id, name: c.name }))}
                    placeholder="Select company"
                    required loading={loadingCompanies}
                    error={touched.company && errors.company}
                  />
                  <FormSelect
                    label="Location" name="location"
                    value={selectedLocationId}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    options={cityLocations.map(l => ({ id: l.id, name: l.name }))}
                    placeholder={selectedCompanyId ? 'Select location' : 'Select company first'}
                    required loading={loadingCityLocations}
                    error={touched.location && errors.location}
                    disabled={!selectedCompanyId}
                  />
                </div>

                {/* Row 2: Department + Product Name */}
                <div className="sm-form-grid sm-form-grid-2" style={{ marginTop: '12px' }}>
                  <FormSelect
                    label="Department" name="departmentId"
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                    onBlur={handleBlur}
                    options={departments.map(d => ({ id: d.id, name: d.name }))}
                    placeholder={selectedLocationId ? 'Select department' : 'Select location first'}
                    required loading={loadingDepartments}
                    error={touched.departmentId && errors.departmentId}
                    disabled={!selectedLocationId}
                  />
                  {/* ── Product Name — multi-select ── */}
                  <FormSelect
                    label="Product Name" name="productId"
                    value={formData.productId}
                    onChange={handleProductChange}
                    onBlur={handleBlur}
                    options={products.map(p => ({ id: p.id, name: p.name }))}
                    placeholder={formData.departmentId ? 'Select product' : 'Select department first'}
                    required loading={loadingProducts}
                    error={touched.productId && errors.productId}
                    disabled={!formData.departmentId}
                    multiple
                  />
                </div>


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
