import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package, Layers, FileText, Save, ArrowLeft, RefreshCw,
  CheckCircle, Shield, Zap, Eye, Plus, Trash2, Ruler, Wrench,
  Check, AlertCircle, ChevronDown, ChevronUp, Upload, File as FileIcon,
} from 'lucide-react';

import { Header, Card } from '../../../components/common';
import {
  FormInput, FormSelect, FormToggle, FormCheckboxCard, FormFileUpload,
  CategorySelector, FormSection, FormButton, SuccessModal,
} from './components/FormComponents';

import {
  getProductCategories, getSamplingPlans, getQCPlans,
  getUnits, getInstruments,
  createComponent, updateComponent, getComponentById,
  uploadAttachment, deleteDocument,
  validatePartCode as apiValidatePartCode,
} from './api/componentMasterApi';

import {
  validateField, validateForm, validatePartCodeUnique,
  getInitialFormState, getInitialErrorState, debounce,
  hasErrors, clearFieldError, setFieldError,
} from './api/validation';

import './styles/ComponentMasterEntry.css';
import { colors } from '../../../constants/theme';

/* ═══ DESIGN TOKENS ═══ */
const T = {
  bg:'#f5f6f8',card:'#fff',border:'#e0e4ea',borderLt:'#edf0f5',
  text:'#1a1f36',textSec:'#525f7f',textMuted:'#8898aa',
  primary:'#1a56db',primaryBg:'#eef2ff',
  success:'#059669',successBg:'#ecfdf5',
  danger:'#dc2626',warning:'#d97706',warningBg:'#fffbeb',
  radius:'6px',radiusLg:'8px',
  shadow:'0 1px 2px rgba(0,0,0,.05)',
};

/* ═══ COMPACT STYLE OBJECTS ═══ */
const cs = {
  page:{minHeight:'100vh',background:T.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"},
  topBar:{background:'linear-gradient(135deg,#1e3a5f,#1a56db)',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',color:'#fff'},
  topLeft:{display:'flex',alignItems:'center',gap:'10px'},
  topIcon:{width:32,height:32,borderRadius:7,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'},
  topTitle:{fontSize:15,fontWeight:700},topSub:{fontSize:11,opacity:.7},
  topBtns:{display:'flex',gap:6},
  topBtn:{padding:'5px 12px',fontSize:11,fontWeight:600,borderRadius:5,border:'1px solid rgba(255,255,255,.25)',background:'rgba(255,255,255,.1)',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:5},
  content:{padding:'14px 24px 24px',maxWidth:1180,margin:'0 auto'},
  sec:{background:T.card,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,boxShadow:T.shadow,marginBottom:10,overflow:'hidden'},
  secH:{padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.borderLt}`,background:'#fafbfc'},
  secHL:{display:'flex',alignItems:'center',gap:7},
  secIcon:{width:26,height:26,borderRadius:5,background:T.primaryBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  secTitle:{fontSize:12,fontWeight:700,color:T.text},
  secBadge:{fontSize:9,fontWeight:600,color:T.textMuted,background:'#f0f2f5',padding:'2px 7px',borderRadius:10,textTransform:'uppercase',letterSpacing:'.04em'},
  secBody:{padding:'12px 14px'},
  g2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10},
  g3:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10},
  mt8:{marginTop:8},
  lbl:{display:'block',fontSize:10,fontWeight:600,color:T.textSec,marginBottom:3,textTransform:'uppercase',letterSpacing:'.04em'},
  req:{color:T.danger,marginLeft:2},
  err:{fontSize:10,color:T.danger,marginTop:2},
  togRow:{display:'flex',gap:6,marginBottom:8},
  togBtn:(on)=>({flex:1,padding:'7px 10px',textAlign:'center',border:`1.5px solid ${on?T.primary:T.border}`,borderRadius:T.radius,cursor:'pointer',fontSize:12,fontWeight:600,background:on?T.primaryBg:'#fff',color:on?T.primary:T.textSec,transition:'all .15s'}),
  ctRow:{display:'flex',gap:8,flexWrap:'wrap'},
  ctCard:(on)=>({flex:'1 1 200px',padding:'9px 12px',border:`1.5px solid ${on?T.primary:T.border}`,borderRadius:T.radius,cursor:'pointer',background:on?T.primaryBg:'#fff',display:'flex',alignItems:'center',gap:9,transition:'all .15s'}),
  ctCb:(on)=>({width:16,height:16,borderRadius:3,border:`2px solid ${on?T.primary:'#ccc'}`,background:on?T.primary:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}),
  ctLbl:{fontSize:12,fontWeight:600,color:T.text},ctDesc:{fontSize:10,color:T.textMuted},
  specChk:(on)=>({display:'inline-flex',alignItems:'center',gap:7,padding:'7px 12px',border:`1px solid ${on?T.primary:T.border}`,borderRadius:T.radius,cursor:'pointer',background:on?T.primaryBg:'#fff',marginBottom:10}),
  specCb:(on)=>({width:15,height:15,borderRadius:3,border:`2px solid ${on?T.primary:'#bbb'}`,background:on?T.primary:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}),
  upZone:{border:`1.5px dashed ${T.border}`,borderRadius:T.radius,padding:'10px 14px',textAlign:'center',cursor:'pointer',background:'#fafbfc'},
  upLbl:{fontSize:11,color:T.textMuted,fontWeight:500},
  docTbl:{width:'100%',borderCollapse:'separate',borderSpacing:0,fontSize:11,border:`1px solid ${T.border}`,borderRadius:T.radius,overflow:'hidden',marginTop:10},
  docTh:{padding:'6px 10px',background:'#f7f8fa',fontWeight:600,color:T.textSec,borderBottom:`1px solid ${T.border}`,textAlign:'left',fontSize:9,textTransform:'uppercase',letterSpacing:'.04em'},
  docTd:{padding:'7px 10px',borderBottom:`1px solid ${T.borderLt}`,verticalAlign:'middle'},
  docName:{display:'flex',alignItems:'center',gap:5,fontWeight:500,color:T.text},
  docBadge:(tp)=>{const m={drawing:{bg:'#eef2ff',c:'#4338ca'},specification:{bg:'#ecfdf5',c:'#059669'}};const x=m[tp]||{bg:'#f0f2f5',c:'#525f7f'};return{display:'inline-block',padding:'1px 7px',borderRadius:10,fontSize:9,fontWeight:600,background:x.bg,color:x.c,textTransform:'uppercase'};},
  docRm:{padding:'3px 7px',border:`1px solid ${T.border}`,borderRadius:4,background:'#fff',color:T.danger,cursor:'pointer',fontSize:10,fontWeight:500,display:'flex',alignItems:'center',gap:3},
  pHdr:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',marginTop:10},
  pTitle:{display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,color:T.text},
  pCnt:{fontSize:10,color:T.textMuted,fontWeight:500,background:'#f0f2f5',padding:'1px 7px',borderRadius:10},
  pAdd:{padding:'3px 9px',fontSize:10,fontWeight:600,border:`1px solid ${T.border}`,borderRadius:T.radius,background:'#fff',color:T.primary,cursor:'pointer',display:'flex',alignItems:'center',gap:3},
  pTbl:{width:'100%',borderCollapse:'separate',borderSpacing:0,fontSize:11,border:`1px solid ${T.border}`,borderRadius:T.radius,overflow:'hidden'},
  pTh:{padding:'5px 7px',background:'#f7f8fa',fontWeight:600,color:T.textSec,borderBottom:`1px solid ${T.border}`,textAlign:'left',fontSize:9,textTransform:'uppercase',letterSpacing:'.04em'},
  pTd:{padding:'3px 5px',borderBottom:`1px solid ${T.borderLt}`,verticalAlign:'middle'},
  pIn:{width:'100%',padding:'4px 7px',fontSize:11,border:`1px solid ${T.border}`,borderRadius:4,outline:'none',boxSizing:'border-box'},
  pSel:{width:'100%',padding:'4px 5px',fontSize:11,border:`1px solid ${T.border}`,borderRadius:4,outline:'none',boxSizing:'border-box',background:'#fff'},
  pDel:{padding:3,border:'none',background:'none',cursor:'pointer',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'},
  combBnr:{display:'flex',alignItems:'center',gap:7,padding:'7px 10px',background:T.warningBg,border:'1px solid #fde68a',borderRadius:T.radius,fontSize:11,color:T.warning,marginTop:8},
  noHint:{display:'flex',alignItems:'center',gap:5,padding:'7px 10px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:T.radius,fontSize:11,color:T.danger,marginTop:8},
  sumBar:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',background:T.successBg,border:'1px solid #a7f3d0',borderRadius:T.radius,cursor:'pointer',marginTop:10},
  sumTitle:{display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:T.success},
  sumPill:(tp)=>({display:'inline-flex',alignItems:'center',gap:2,padding:'1px 7px',borderRadius:10,fontSize:9,fontWeight:600,background:tp==='visual'?'#eef2ff':'#fef3c7',color:tp==='visual'?'#4338ca':'#92400e'}),
  sumTbl:{width:'100%',borderCollapse:'collapse',fontSize:10,marginTop:6},
  sumTh:{padding:'4px 7px',background:'#f0fdf4',fontWeight:600,color:T.textSec,borderBottom:'1px solid #d1fae5',textAlign:'left',fontSize:9},
  sumTd:{padding:'3px 7px',borderBottom:'1px solid #ecfdf5'},
  ftr:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderTop:`1px solid ${T.border}`,background:'#fafbfc'},
  ftrR:{display:'flex',gap:7},
  btnO:{padding:'6px 14px',fontSize:11,fontWeight:600,border:`1px solid ${T.border}`,borderRadius:T.radius,background:'#fff',color:T.textSec,cursor:'pointer',display:'flex',alignItems:'center',gap:5},
  btnP:{padding:'6px 16px',fontSize:11,fontWeight:600,border:'none',borderRadius:T.radius,background:T.primary,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:5},
  btnG:{padding:'6px 10px',fontSize:11,fontWeight:500,border:'none',borderRadius:T.radius,background:'transparent',color:T.textMuted,cursor:'pointer',display:'flex',alignItems:'center',gap:5},
  colBtn:{padding:'2px 5px',border:'none',background:'none',cursor:'pointer',color:T.textMuted,display:'flex',alignItems:'center'},
};

const fmtSize=(b)=>{if(!b)return'—';if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB';};
const docTypeLabel={drawingAttachment:'Drawing',specFile:'Specification'};
const docTypeKey={drawingAttachment:'drawing',specFile:'specification'};

/* ═══ COMPONENT ═══ */
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

  const [visualEnabled, setVisualEnabled] = useState(true);
  const [functionalEnabled, setFunctionalEnabled] = useState(false);
  const [visualParams, setVisualParams] = useState([{ id: 1, checkingPoint: '', unit: '', specification: '', instrumentName: '' }]);
  const [functionalParams, setFunctionalParams] = useState([{ id: 1, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }]);
  const [visualCollapsed, setVisualCollapsed] = useState(false);
  const [functionalCollapsed, setFunctionalCollapsed] = useState(false);
  const [showParamSummary, setShowParamSummary] = useState(false);
  const [visualSpecSheet, setVisualSpecSheet] = useState(null);
  const [functionalSpecSheet, setFunctionalSpecSheet] = useState(null);

  const [categories, setCategories] = useState([]);
  const [samplingPlans, setSamplingPlans] = useState([]);
  const [qcPlans, setQCPlans] = useState([]);
  const [apiUnits, setApiUnits] = useState([]);
  const [apiInstruments, setApiInstruments] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSamplingPlans, setLoadingSamplingPlans] = useState(true);
  const [loadingQCPlans, setLoadingQCPlans] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        setCategories(await getProductCategories());
        setLoadingCategories(false);
        setLoadingSamplingPlans(true);
        setSamplingPlans(await getSamplingPlans());
        setLoadingSamplingPlans(false);
        setLoadingQCPlans(true);
        setQCPlans(await getQCPlans());
        setLoadingQCPlans(false);
        try { setApiUnits(await getUnits()); } catch (x) { console.warn('Units lookup failed:', x); }
        try { setApiInstruments(await getInstruments()); } catch (x) { console.warn('Instruments lookup failed:', x); }
      } catch (e) { console.error('Error loading master data:', e); }
    })();
  }, []);

  useEffect(() => { if (isEditing && id) loadComponent(); }, [id]);

  const loadComponent = async () => {
    setIsLoading(true);
    try {
      const comp = await getComponentById(id);
      setFormData(prev => ({ ...prev,
        partCode: comp.partCode || '', partName: comp.partName || '',
        partDescription: comp.partDescription || '',
        productCategory: comp.productCategoryId || comp.productCategory || '',
        // productGroup removed per feedback (Ref: 7.3.0 DB-02)
        inspectionType: comp.inspectionType === '100_percent' ? '100%' : (comp.inspectionType || 'sampling'),
        samplingPlan: comp.samplingPlanId || comp.samplingPlan || '',
        qcPlanNo: comp.qcPlanId || comp.qcPlanNo || '',
        drawingNo: comp.drawingNo || '',
        prProcessCode: comp.prProcessCode || '',
        // testCertRequired removed per feedback
        specRequired: comp.specRequired || false,
        // fqirRequired removed per feedback
        skipLotEnabled: comp.skipLotEnabled || false,
        skipLotCount: comp.skipLotCount || '',
        skipLotThreshold: comp.skipLotThreshold || '',
      }));
      setPartCodeValid(true);

      if (comp.visualParams && comp.visualParams.length > 0) {
        setVisualEnabled(true);
        setVisualParams(comp.visualParams.map((p, i) => ({
          id: p.id || i + 1, checkingPoint: p.checkingPoint || '',
          unit: p.unit || '', specification: p.specification || '',
          instrumentName: p.instrumentName || '',
        })));
      }
      if (comp.functionalParams && comp.functionalParams.length > 0) {
        setFunctionalEnabled(true);
        setFunctionalParams(comp.functionalParams.map((p, i) => ({
          id: p.id || i + 1, checkingPoint: p.checkingPoint || '',
          unit: p.unit || 'mm', specification: p.specification || '',
          instrumentName: p.instrumentName || '',
          toleranceMin: p.toleranceMin || '', toleranceMax: p.toleranceMax || '',
        })));
      }

      if (comp.documents && comp.documents.length > 0) {
        setExistingDocuments(comp.documents);
        const map = { drawing: 'drawingAttachment', specification: 'specFile' };
        const upd = {};
        comp.documents.forEach(d => {
          const f = map[d.documentType];
          if (f) upd[f] = { name: d.fileName, size: d.fileSize || 0, type: d.mimeType || 'application/octet-stream', _isExisting: true, _docId: d.id, _filePath: d.filePath };
        });
        if (Object.keys(upd).length) setFormData(prev => ({ ...prev, ...upd }));
      }

      // Load spec sheet documents for checking parameters
      if (comp.documents && comp.documents.length > 0) {
        comp.documents.forEach(d => {
          if (d.documentType === 'visual_spec_sheet') {
            setVisualSpecSheet({
              name: d.originalName || d.fileName,
              size: d.fileSize || 0,
              type: d.mimeType || 'application/pdf',
              _isExisting: true,
              _docId: d.id,
              _filePath: d.filePath,
            });
          }
          if (d.documentType === 'functional_spec_sheet') {
            setFunctionalSpecSheet({
              name: d.originalName || d.fileName,
              size: d.fileSize || 0,
              type: d.mimeType || 'application/pdf',
              _isExisting: true,
              _docId: d.id,
              _filePath: d.filePath,
            });
          }
        });
      }
    } catch (e) {
      console.error('Failed to load component:', e);
      alert('Failed to load component data: ' + e.message);
      navigate('/admin/component-master');
    } finally { setIsLoading(false); }
  };

  const checkPartCodeUnique = useCallback(
    debounce(async (v) => {
      if (!v || v.length < 3) return;
      setPartCodeChecking(true);
      try {
        const r = await apiValidatePartCode(v);
        setPartCodeValid(r.isUnique);
        if (!r.isUnique) setErrors(p => setFieldError(p, 'partCode', 'This part code already exists'));
      } catch (e) { console.error('Part code validation error:', e); }
      finally { setPartCodeChecking(false); }
    }, 500), []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nv = type === 'checkbox' ? checked : value;
    setFormData(p => ({ ...p, [name]: nv }));
    if (errors[name]) setErrors(p => clearFieldError(p, name));
    if (name === 'partCode') { setPartCodeValid(false); checkPartCodeUnique(value); }
    if (name === 'inspectionType' && value === '100%') {
      setFormData(p => ({ ...p, samplingPlan: '' }));
      setErrors(p => clearFieldError(p, 'samplingPlan'));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    const err = validateField(name, value, formData);
    if (err) setErrors(p => setFieldError(p, name, err));
  };

  const handleFileChange = async (e) => {
    const { name, value, error } = e.target;
    const cur = formData[name];
    if (!value && cur && cur._isExisting && cur._docId) {
      try { await deleteDocument(cur._docId); setExistingDocuments(p => p.filter(d => d.id !== cur._docId)); }
      catch (x) { console.error('Error deleting document:', x); }
    }
    setFormData(p => ({ ...p, [name]: value }));
    if (error) setErrors(p => setFieldError(p, name, error));
    else setErrors(p => clearFieldError(p, name));
  };

  const handleDirectUpload = (field, accept) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const mx = field === 'drawingAttachment' ? 10 : 5;
      if (f.size / 1048576 > mx) { setErrors(p => setFieldError(p, field, `File must be < ${mx}MB`)); return; }
      setFormData(p => ({ ...p, [field]: f }));
      setErrors(p => clearFieldError(p, field));
    };
    inp.click();
  };

  const handleRemoveFile = async (field) => {
    const cur = formData[field];
    if (cur && cur._isExisting && cur._docId) {
      try { await deleteDocument(cur._docId); setExistingDocuments(p => p.filter(d => d.id !== cur._docId)); }
      catch (x) { console.error('Error deleting:', x); }
    }
    setFormData(p => ({ ...p, [field]: null }));
    setErrors(p => clearFieldError(p, field));
  };

  const handleSpecSheetUpload = (type) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.pdf';
    inp.onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size / 1048576 > 5) {
        alert('Spec sheet must be less than 5MB');
        return;
      }
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are allowed for spec sheets');
        return;
      }
      if (type === 'visual') setVisualSpecSheet(f);
      else setFunctionalSpecSheet(f);
    };
    inp.click();
  };

  const handleSpecSheetRemove = async (type) => {
    const current = type === 'visual' ? visualSpecSheet : functionalSpecSheet;
    if (current && current._isExisting && current._docId) {
      try {
        await deleteDocument(current._docId);
        setExistingDocuments(p => p.filter(d => d.id !== current._docId));
      } catch (x) {
        console.error('Error deleting spec sheet:', x);
      }
    }
    if (type === 'visual') setVisualSpecSheet(null);
    else setFunctionalSpecSheet(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData);
    setErrors(ve);
    setTouched(Object.keys(formData).reduce((a, k) => ({ ...a, [k]: true }), {}));

    if (!visualEnabled && !functionalEnabled) {
      document.querySelector('[data-section="ct"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isValid) {
      const fk = Object.keys(ve).find(k => ve[k]);
      if (fk) document.querySelector(`[name="${fk}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    let ct = '';
    if (visualEnabled && functionalEnabled) ct = 'dimensional_visual';
    else if (visualEnabled) ct = 'visual';
    else if (functionalEnabled) ct = 'functional';

    const ap = [];
    if (visualEnabled) visualParams.filter(p => p.checkingPoint.trim()).forEach(p => ap.push({ ...p, type: 'visual', id: ap.length + 1 }));
    if (functionalEnabled) functionalParams.filter(p => p.checkingPoint.trim()).forEach(p => ap.push({ ...p, type: 'functional', id: ap.length + 1 }));

    const sd = { ...formData, checkingParameters: { type: ct, parameters: ap } };
    setIsSubmitting(true);
    let saveSuccess = false;
    try {
      let sc;
      if (isEditing) sc = await updateComponent(id, sd);
      else sc = await createComponent(sd);
      saveSuccess = true;
      const cid = isEditing ? id : (sc?.id || null);
      if (cid) {
        for (const fn of ['drawingAttachment', 'specFile']) {
          const fv = formData[fn];
          if (fv && fv instanceof File) {
            try { await uploadAttachment(fv, cid, fn); } catch (x) { console.error(`Upload ${fn}:`, x); }
          }
        }
        // Upload spec sheet PDFs for checking parameters
        if (visualSpecSheet && visualSpecSheet instanceof File) {
          try { await uploadAttachment(visualSpecSheet, cid, 'visualSpecSheet'); }
          catch (x) { console.error('Upload visualSpecSheet:', x); }
        }
        if (functionalSpecSheet && functionalSpecSheet instanceof File) {
          try { await uploadAttachment(functionalSpecSheet, cid, 'functionalSpecSheet'); }
          catch (x) { console.error('Upload functionalSpecSheet:', x); }
        }
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'}:`, err);
      const msg = typeof err?.message === 'string' ? err.message : 'An unexpected error occurred';
      alert(`Failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
      if (saveSuccess) setShowSuccess(true);
    }
  };

  const handleReset = () => {
    setFormData(getInitialFormState()); setErrors(getInitialErrorState());
    setTouched({}); setPartCodeValid(false);
    setVisualEnabled(false); setFunctionalEnabled(false);
    setVisualParams([{ id: 1, checkingPoint: '', unit: '', specification: '', instrumentName: '' }]);
    setFunctionalParams([{ id: 1, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }]);
    setVisualCollapsed(false); setFunctionalCollapsed(false); setShowParamSummary(false);
    setVisualSpecSheet(null); setFunctionalSpecSheet(null);
  };

  const handleCreateAnother = () => { setShowSuccess(false); handleReset(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const unitOpts = apiUnits.length > 0
    ? [{ value:'',label:'—' }, ...apiUnits.map(u => ({ value: u.code || u.name, label: u.name || u.code }))]
    : [
        { value:'',label:'—' },{ value:'mm',label:'mm' },{ value:'cm',label:'cm' },{ value:'CM',label:'CM' },
        { value:'inch',label:'inch' },{ value:'kg',label:'kg' },{ value:'g',label:'g' },
        { value:'nos',label:'Nos' },{ value:'pcs',label:'Pcs' },{ value:'units',label:'Units' },
        { value:'ply',label:'Ply' },{ value:'%',label:'%' },{ value:'V',label:'V' },
        { value:'A',label:'A' },{ value:'Ω',label:'Ω' },{ value:'MHz',label:'MHz' },
        { value:'PIN',label:'PIN' },{ value:'CORE',label:'CORE' },{ value:'ZZ',label:'ZZ' },
      ];
  const instOpts = apiInstruments.length > 0
    ? [{ value:'',label:'Select' }, ...apiInstruments.map(i => ({ value: i.name || i.code, label: i.name || i.code }))]
    : [
        { value:'',label:'Select' },{ value:'Visual',label:'Visual' },{ value:'Scale',label:'Scale' },
        { value:'Vernier',label:'Vernier' },{ value:'Micrometer',label:'Micrometer' },
        { value:'Multimeter',label:'Multimeter' },{ value:'Oscilloscope',label:'Oscilloscope' },
        { value:'Gauge',label:'Gauge' },
      ];

  const toggleCT = (t) => { if (t === 'visual') setVisualEnabled(p => !p); else setFunctionalEnabled(p => !p); };
  const addVP = () => { const n = Math.max(...visualParams.map(p => p.id), 0) + 1; setVisualParams([...visualParams, { id: n, checkingPoint: '', unit: '', specification: '', instrumentName: '' }]); };
  const rmVP = (pid) => { if (visualParams.length > 1) setVisualParams(visualParams.filter(p => p.id !== pid)); };
  const upVP = (pid, f, v) => { setVisualParams(visualParams.map(p => p.id === pid ? { ...p, [f]: v } : p)); };
  const addFP = () => { const n = Math.max(...functionalParams.map(p => p.id), 0) + 1; setFunctionalParams([...functionalParams, { id: n, checkingPoint: '', unit: 'mm', specification: '', instrumentName: '', toleranceMin: '', toleranceMax: '' }]); };
  const rmFP = (pid) => { if (functionalParams.length > 1) setFunctionalParams(functionalParams.filter(p => p.id !== pid)); };
  const upFP = (pid, f, v) => { setFunctionalParams(functionalParams.map(p => p.id === pid ? { ...p, [f]: v } : p)); };

  const fVC = visualParams.filter(p => p.checkingPoint.trim()).length;
  const fFC = functionalParams.filter(p => p.checkingPoint.trim()).length;
  const totP = (visualEnabled ? fVC : 0) + (functionalEnabled ? fFC : 0);
  const uploadedDocs = ['drawingAttachment','specFile'].filter(f => formData[f]).map(f => ({
    field: f, file: formData[f], type: docTypeKey[f], label: docTypeLabel[f],
    name: formData[f]?.name || 'Unknown', size: formData[f]?.size || 0,
    existing: !!formData[f]?._isExisting,
  }));

  /* ═══ RENDER ═══ */
  if (isLoading) return (
    <div style={cs.page}><div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
      <div style={{textAlign:'center'}}><RefreshCw size={26} style={{animation:'spin 1s linear infinite',color:T.textMuted}} />
      <p style={{marginTop:10,color:T.textMuted,fontSize:12}}>Loading…</p></div></div></div>
  );

  return (
    <div style={cs.page}>
      {/* TOP BAR */}
      <div style={cs.topBar}>
        <div style={cs.topLeft}>
          <div style={cs.topIcon}><Package size={18} /></div>
          <div><div style={cs.topTitle}>{isEditing ? 'Edit Component' : 'New Component Entry'}</div>
          <div style={cs.topSub}>{isEditing ? 'Update details' : 'Register a new QC component'}</div></div>
        </div>
        <div style={cs.topBtns}>
          <button style={cs.topBtn} onClick={() => navigate('/admin/component-master')} type="button"><ArrowLeft size={13} /> Back</button>
          <button style={cs.topBtn} onClick={handleReset} type="button"><RefreshCw size={13} /> Reset</button>
        </div>
      </div>

      <div style={cs.content}>
        <form onSubmit={handleSubmit}>

          {/* ═ SECTION 1: Classification + Part ID ═ */}
          <div style={cs.sec}>
            <div style={cs.secH}>
              <div style={cs.secHL}><div style={cs.secIcon}><Layers size={14} color={T.primary} /></div><span style={cs.secTitle}>Classification & Part Identification</span></div>
              <span style={cs.secBadge}>Step 1 / 4</span>
            </div>
            <div style={cs.secBody}>
              <CategorySelector categories={categories} value={formData.productCategory} onChange={handleChange} error={touched.productCategory && errors.productCategory} required />
              <div style={{...cs.g3,...cs.mt8}}>
                <div><label style={cs.lbl}>QC Plan<span style={cs.req}>*</span></label>
                  <FormSelect name="qcPlanNo" value={formData.qcPlanNo} onChange={handleChange} options={qcPlans.map(p=>({value:p.id,label:`${p.id} - ${p.name}`}))} placeholder="Select QC plan" error={touched.qcPlanNo&&errors.qcPlanNo} onBlur={handleBlur} required loading={loadingQCPlans} /></div>
                <div><label style={cs.lbl}>Part Code<span style={cs.req}>*</span></label>
                  <FormInput name="partCode" value={formData.partCode} onChange={handleChange} onBlur={handleBlur} error={touched.partCode&&errors.partCode} required placeholder="e.g., RCNA-001"
                    suffix={partCodeChecking?<RefreshCw size={11} className="cm-spin" style={{color:'#2196F3'}}/>:partCodeValid?<CheckCircle size={11} style={{color:'#4CAF50'}}/>:null} /></div>
                <div><label style={cs.lbl}>Part Name<span style={cs.req}>*</span></label>
                  <FormInput name="partName" value={formData.partName} onChange={handleChange} onBlur={handleBlur} error={touched.partName&&errors.partName} required placeholder="e.g., CHANNEL FRAME" /></div>
              </div>
              <div style={{...cs.g2,...cs.mt8}}>
                <div><label style={cs.lbl}>Drawing No</label>
                  <FormInput name="drawingNo" value={formData.drawingNo} onChange={handleChange} onBlur={handleBlur} error={touched.drawingNo&&errors.drawingNo} placeholder="e.g., DWG-001-R3" /></div>
                <div><label style={cs.lbl}>Source Type</label>
                  <FormSelect name="prProcessCode" value={formData.prProcessCode} onChange={handleChange}
                    options={[{value:'direct_purchase_external',label:'Direct Purchase – External'},{value:'direct_purchase_internal',label:'Direct Purchase – Internal'},{value:'job_work_internal',label:'Job Work – Internal'},{value:'job_work_external',label:'Job Work – External/Subcontract'}]}
                    placeholder="Select source type" error={touched.prProcessCode&&errors.prProcessCode} onBlur={handleBlur} /></div>
              </div>
            </div>
          </div>

          {/* ═ SECTION 2: Inspection Config ═ */}
          <div style={cs.sec}>
            <div style={cs.secH}>
              <div style={cs.secHL}><div style={cs.secIcon}><Shield size={14} color={T.primary} /></div><span style={cs.secTitle}>Inspection Configuration</span></div>
              <span style={cs.secBadge}>Step 2 / 4</span>
            </div>
            <div style={cs.secBody}>
              <div style={cs.togRow}>
                <div style={cs.togBtn(formData.inspectionType==='100%')} onClick={()=>handleChange({target:{name:'inspectionType',value:'100%',type:'text'}})}>100% Inspection</div>
                <div style={cs.togBtn(formData.inspectionType==='sampling')} onClick={()=>handleChange({target:{name:'inspectionType',value:'sampling',type:'text'}})}>Sampling Inspection</div>
              </div>
              {formData.inspectionType==='sampling'&&(
                <div style={{maxWidth:380}}><label style={cs.lbl}>Sampling Plan<span style={cs.req}>*</span></label>
                  <FormSelect name="samplingPlan" value={formData.samplingPlan} onChange={handleChange} options={samplingPlans.map(p=>({value:p.id,label:`${p.name} (${p.aqlLevel})`}))} placeholder="Select sampling plan" error={touched.samplingPlan&&errors.samplingPlan} onBlur={handleBlur} required loading={loadingSamplingPlans} /></div>
              )}
            </div>
          </div>

          {/* ═ SECTION 3: Documentation & Compliance ═ */}
          <div style={cs.sec}>
            <div style={cs.secH}>
              <div style={cs.secHL}><div style={cs.secIcon}><FileText size={14} color={T.primary} /></div><span style={cs.secTitle}>Documentation & Compliance</span></div>
              <span style={cs.secBadge}>Step 3 / 4</span>
            </div>
            <div style={cs.secBody}>
              <div style={cs.specChk(formData.specRequired)} onClick={()=>handleChange({target:{name:'specRequired',value:!formData.specRequired,type:'checkbox',checked:!formData.specRequired}})}>
                <div style={cs.specCb(formData.specRequired)}>{formData.specRequired&&<Check size={9} color="#fff" strokeWidth={3}/>}</div>
                <div><div style={{fontSize:11,fontWeight:600,color:T.text}}>Specification Document Required</div>
                <div style={{fontSize:10,color:T.textMuted}}>Detailed spec must be attached</div></div>
              </div>
              <div style={cs.g2}>
                <div style={cs.upZone} onClick={()=>handleDirectUpload('drawingAttachment','.pdf,.png,.jpg,.jpeg,.dwg')}>
                  <Upload size={16} color={T.textMuted}/><div style={cs.upLbl}>{formData.drawingAttachment?'✓ Replace Drawing':'Upload Drawing'}</div>
                  <div style={{fontSize:9,color:T.textMuted}}>PDF, PNG, JPG, DWG · Max 10MB</div></div>
                <div style={cs.upZone} onClick={()=>handleDirectUpload('specFile','.pdf,.png,.jpg,.jpeg')}>
                  <Upload size={16} color={T.textMuted}/><div style={cs.upLbl}>{formData.specFile?'✓ Replace Specification':'Upload Specification'}</div>
                  <div style={{fontSize:9,color:T.textMuted}}>PDF, PNG, JPG · Max 5MB</div></div>
              </div>
              {errors.drawingAttachment&&<div style={cs.err}>{errors.drawingAttachment}</div>}
              {errors.specFile&&<div style={cs.err}>{errors.specFile}</div>}

              {/* UPLOADED DOCUMENTS TABLE */}
              {uploadedDocs.length > 0 ? (
                <table style={cs.docTbl}>
                  <thead><tr>
                    <th style={cs.docTh}>Type</th><th style={cs.docTh}>File Name</th>
                    <th style={cs.docTh}>Size</th><th style={cs.docTh}>Status</th>
                    <th style={{...cs.docTh,textAlign:'center',width:70}}>Action</th>
                  </tr></thead>
                  <tbody>{uploadedDocs.map(d=>(
                    <tr key={d.field}>
                      <td style={cs.docTd}><span style={cs.docBadge(d.type)}>{d.label}</span></td>
                      <td style={cs.docTd}><div style={cs.docName}><FileIcon size={12} color={T.textMuted}/>{d.name}</div></td>
                      <td style={cs.docTd}><span style={{fontSize:10,color:T.textMuted}}>{fmtSize(d.size)}</span></td>
                      <td style={cs.docTd}>{d.existing
                        ?<span style={{fontSize:10,color:T.success,fontWeight:600}}>● Saved</span>
                        :<span style={{fontSize:10,color:T.warning,fontWeight:600}}>● Pending</span>}</td>
                      <td style={{...cs.docTd,textAlign:'center'}}><button type="button" style={cs.docRm} onClick={()=>handleRemoveFile(d.field)}><Trash2 size={11}/> Remove</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : (
                <div style={{textAlign:'center',padding:8,fontSize:11,color:T.textMuted,marginTop:6}}>No documents uploaded</div>
              )}
            </div>
          </div>

          {/* ═ SECTION 4: Checking Parameters ═ */}
          <div style={cs.sec} data-section="ct">
            <div style={cs.secH}>
              <div style={cs.secHL}><div style={cs.secIcon}><Ruler size={14} color={T.primary} /></div><span style={cs.secTitle}>Checking Parameters</span></div>
              <span style={cs.secBadge}>Step 4 / 4</span>
            </div>
            <div style={cs.secBody}>
              <label style={{...cs.lbl,marginBottom:6}}>Checking Type<span style={cs.req}>*</span></label>
              <div style={cs.ctRow}>
                <div style={cs.ctCard(visualEnabled)} onClick={()=>toggleCT('visual')}>
                  <div style={cs.ctCb(visualEnabled)}>{visualEnabled&&<Check size={10} color="#fff" strokeWidth={3}/>}</div>
                  <Eye size={18} color={visualEnabled?T.primary:T.textMuted}/>
                  <div><div style={cs.ctLbl}>Visual Inspection</div><div style={cs.ctDesc}>Surface, appearance, damage</div></div>
                  {visualEnabled&&fVC>0&&<span style={cs.sumPill('visual')}>{fVC}</span>}
                </div>
                <div style={cs.ctCard(functionalEnabled)} onClick={()=>toggleCT('functional')}>
                  <div style={cs.ctCb(functionalEnabled)}>{functionalEnabled&&<Check size={10} color="#fff" strokeWidth={3}/>}</div>
                  <Wrench size={18} color={functionalEnabled?T.primary:T.textMuted}/>
                  <div><div style={cs.ctLbl}>Functional Testing</div><div style={cs.ctDesc}>Measurements, tolerances</div></div>
                  {functionalEnabled&&fFC>0&&<span style={cs.sumPill('functional')}>{fFC}</span>}
                </div>
              </div>

              {visualEnabled&&functionalEnabled&&(
                <div style={cs.combBnr}><Zap size={14}/><span><strong>Combined:</strong> Both Visual + Functional stages required.</span></div>
              )}
              {!visualEnabled&&!functionalEnabled&&(
                <div style={cs.noHint}><AlertCircle size={13}/><span>Select at least one checking type</span></div>
              )}

              {/* VISUAL PARAMS */}
              {visualEnabled&&(<>
                <div style={cs.pHdr}>
                  <div style={cs.pTitle}><Eye size={13} color={T.primary}/><span>Visual Parameters</span><span style={cs.pCnt}>{visualParams.length}</span></div>

                  {/* ── Spec Sheet Upload (Visual) ── */}
                  {!visualSpecSheet ? (
                    <button type="button" onClick={() => handleSpecSheetUpload('visual')}
                      style={{
                        display:'inline-flex',alignItems:'center',gap:4,
                        padding:'4px 10px',fontSize:10,fontWeight:500,
                        border:`1px dashed ${T.primary}`,borderRadius:T.radius,
                        background:'#fff',color:T.primary,cursor:'pointer',
                        whiteSpace:'nowrap',
                      }}>
                      <Upload size={11}/> Upload Spec Sheet (PDF)
                    </button>
                  ) : (
                    <div style={{
                      display:'inline-flex',alignItems:'center',gap:6,
                      padding:'3px 8px 3px 10px',fontSize:10,fontWeight:500,
                      border:`1px solid ${T.success}`,borderRadius:T.radius,
                      background:T.successBg,color:T.success,
                      maxWidth:260,
                    }}>
                      <FileIcon size={11}/>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}
                        title={visualSpecSheet.name}>
                        {visualSpecSheet.name}
                      </span>
                      {visualSpecSheet._isExisting && (
                        <span style={{fontSize:8,fontWeight:700,opacity:0.7}}>SAVED</span>
                      )}
                      <button type="button" onClick={() => handleSpecSheetRemove('visual')}
                        title="Remove & Reupload"
                        style={{
                          display:'flex',alignItems:'center',justifyContent:'center',
                          width:18,height:18,borderRadius:'50%',border:'none',
                          background:'rgba(220,38,38,0.1)',color:T.danger,cursor:'pointer',
                          marginLeft:2,padding:0,flexShrink:0,
                        }}>
                        <Trash2 size={10}/>
                      </button>
                    </div>
                  )}

                  <div style={{display:'flex',gap:5,alignItems:'center'}}>
                    <button type="button" style={cs.pAdd} onClick={addVP}><Plus size={11}/> Add</button>
                    <button type="button" style={cs.colBtn} onClick={()=>setVisualCollapsed(!visualCollapsed)}>{visualCollapsed?<ChevronDown size={15}/>:<ChevronUp size={15}/>}</button>
                  </div>
                </div>
                {!visualCollapsed&&(
                  <table style={cs.pTbl}><thead><tr>
                    <th style={{...cs.pTh,width:32}}>#</th><th style={cs.pTh}>Checking Point</th>
                    <th style={{...cs.pTh,width:75}}>Unit</th><th style={cs.pTh}>Specification</th>
                    <th style={{...cs.pTh,width:110}}>Instrument</th><th style={{...cs.pTh,width:32}}></th>
                  </tr></thead><tbody>
                    {visualParams.map((p,i)=>(
                      <tr key={p.id}>
                        <td style={{...cs.pTd,textAlign:'center',color:T.textMuted,fontWeight:600,fontSize:10}}>{i+1}</td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="e.g., Surface Finish" value={p.checkingPoint} onChange={e=>upVP(p.id,'checkingPoint',e.target.value)}/></td>
                        <td style={cs.pTd}><select style={cs.pSel} value={p.unit} onChange={e=>upVP(p.id,'unit',e.target.value)}>{unitOpts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="e.g., No scratches" value={p.specification} onChange={e=>upVP(p.id,'specification',e.target.value)}/></td>
                        <td style={cs.pTd}><select style={cs.pSel} value={p.instrumentName} onChange={e=>upVP(p.id,'instrumentName',e.target.value)}>{instOpts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                        <td style={{...cs.pTd,textAlign:'center'}}><button type="button" style={{...cs.pDel,color:visualParams.length===1?'#ddd':T.danger}} onClick={()=>rmVP(p.id)} disabled={visualParams.length===1}><Trash2 size={12}/></button></td>
                      </tr>
                    ))}
                  </tbody></table>
                )}
              </>)}

              {/* FUNCTIONAL PARAMS */}
              {functionalEnabled&&(<>
                <div style={cs.pHdr}>
                  <div style={cs.pTitle}><Wrench size={13} color={T.primary}/><span>Functional Parameters</span><span style={cs.pCnt}>{functionalParams.length}</span></div>

                  {/* ── Spec Sheet Upload (Functional) ── */}
                  {!functionalSpecSheet ? (
                    <button type="button" onClick={() => handleSpecSheetUpload('functional')}
                      style={{
                        display:'inline-flex',alignItems:'center',gap:4,
                        padding:'4px 10px',fontSize:10,fontWeight:500,
                        border:`1px dashed ${T.primary}`,borderRadius:T.radius,
                        background:'#fff',color:T.primary,cursor:'pointer',
                        whiteSpace:'nowrap',
                      }}>
                      <Upload size={11}/> Upload Spec Sheet (PDF)
                    </button>
                  ) : (
                    <div style={{
                      display:'inline-flex',alignItems:'center',gap:6,
                      padding:'3px 8px 3px 10px',fontSize:10,fontWeight:500,
                      border:`1px solid ${T.success}`,borderRadius:T.radius,
                      background:T.successBg,color:T.success,
                      maxWidth:260,
                    }}>
                      <FileIcon size={11}/>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}
                        title={functionalSpecSheet.name}>
                        {functionalSpecSheet.name}
                      </span>
                      {functionalSpecSheet._isExisting && (
                        <span style={{fontSize:8,fontWeight:700,opacity:0.7}}>SAVED</span>
                      )}
                      <button type="button" onClick={() => handleSpecSheetRemove('functional')}
                        title="Remove & Reupload"
                        style={{
                          display:'flex',alignItems:'center',justifyContent:'center',
                          width:18,height:18,borderRadius:'50%',border:'none',
                          background:'rgba(220,38,38,0.1)',color:T.danger,cursor:'pointer',
                          marginLeft:2,padding:0,flexShrink:0,
                        }}>
                        <Trash2 size={10}/>
                      </button>
                    </div>
                  )}

                  <div style={{display:'flex',gap:5,alignItems:'center'}}>
                    <button type="button" style={cs.pAdd} onClick={addFP}><Plus size={11}/> Add</button>
                    <button type="button" style={cs.colBtn} onClick={()=>setFunctionalCollapsed(!functionalCollapsed)}>{functionalCollapsed?<ChevronDown size={15}/>:<ChevronUp size={15}/>}</button>
                  </div>
                </div>
                {!functionalCollapsed&&(
                  <table style={cs.pTbl}><thead><tr>
                    <th style={{...cs.pTh,width:32}}>#</th><th style={cs.pTh}>Checking Point</th>
                    <th style={{...cs.pTh,width:65}}>Unit</th><th style={cs.pTh}>Specification</th>
                    <th style={{...cs.pTh,width:95}}>Instrument</th>
                    <th style={{...cs.pTh,width:65}}>Min</th><th style={{...cs.pTh,width:65}}>Max</th>
                    <th style={{...cs.pTh,width:32}}></th>
                  </tr></thead><tbody>
                    {functionalParams.map((p,i)=>(
                      <tr key={p.id}>
                        <td style={{...cs.pTd,textAlign:'center',color:T.textMuted,fontWeight:600,fontSize:10}}>{i+1}</td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="e.g., Length" value={p.checkingPoint} onChange={e=>upFP(p.id,'checkingPoint',e.target.value)}/></td>
                        <td style={cs.pTd}><select style={cs.pSel} value={p.unit} onChange={e=>upFP(p.id,'unit',e.target.value)}>{unitOpts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="e.g., 250mm ±0.5" value={p.specification} onChange={e=>upFP(p.id,'specification',e.target.value)}/></td>
                        <td style={cs.pTd}><select style={cs.pSel} value={p.instrumentName} onChange={e=>upFP(p.id,'instrumentName',e.target.value)}>{instOpts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="Min" value={p.toleranceMin} onChange={e=>upFP(p.id,'toleranceMin',e.target.value)}/></td>
                        <td style={cs.pTd}><input style={cs.pIn} placeholder="Max" value={p.toleranceMax} onChange={e=>upFP(p.id,'toleranceMax',e.target.value)}/></td>
                        <td style={{...cs.pTd,textAlign:'center'}}><button type="button" style={{...cs.pDel,color:functionalParams.length===1?'#ddd':T.danger}} onClick={()=>rmFP(p.id)} disabled={functionalParams.length===1}><Trash2 size={12}/></button></td>
                      </tr>
                    ))}
                  </tbody></table>
                )}
              </>)}

              {/* PARAMETER SUMMARY */}
              {(visualEnabled||functionalEnabled)&&totP>0&&(<>
                <div style={cs.sumBar} onClick={()=>setShowParamSummary(!showParamSummary)}>
                  <div style={cs.sumTitle}>
                    <CheckCircle size={13}/><span>{totP} checkpoint{totP!==1?'s':''} defined</span>
                    {visualEnabled&&<span style={cs.sumPill('visual')}><Eye size={9}/> {fVC}</span>}
                    {functionalEnabled&&<span style={cs.sumPill('functional')}><Wrench size={9}/> {fFC}</span>}
                  </div>
                  {showParamSummary?<ChevronUp size={15} color={T.success}/>:<ChevronDown size={15} color={T.success}/>}
                </div>
                {showParamSummary&&(<div style={{marginTop:4}}>
                  {visualEnabled&&fVC>0&&(
                    <table style={cs.sumTbl}><thead><tr>
                      <th style={{...cs.sumTh,width:28}}>#</th><th style={cs.sumTh}>Checking Point</th>
                      <th style={cs.sumTh}>Unit</th><th style={cs.sumTh}>Specification</th><th style={cs.sumTh}>Instrument</th>
                    </tr></thead><tbody>
                      {visualParams.filter(p=>p.checkingPoint.trim()).map((p,i)=>(
                        <tr key={p.id}><td style={cs.sumTd}>{i+1}</td><td style={{...cs.sumTd,fontWeight:500}}>{p.checkingPoint}</td>
                        <td style={cs.sumTd}>{p.unit||'—'}</td><td style={cs.sumTd}>{p.specification||'—'}</td>
                        <td style={cs.sumTd}>{p.instrumentName||'—'}</td></tr>
                      ))}
                    </tbody></table>
                  )}
                  {functionalEnabled&&fFC>0&&(
                    <table style={{...cs.sumTbl,marginTop:6}}><thead><tr>
                      <th style={{...cs.sumTh,width:28}}>#</th><th style={cs.sumTh}>Checking Point</th>
                      <th style={cs.sumTh}>Unit</th><th style={cs.sumTh}>Specification</th><th style={cs.sumTh}>Instrument</th>
                      <th style={cs.sumTh}>Min</th><th style={cs.sumTh}>Max</th>
                    </tr></thead><tbody>
                      {functionalParams.filter(p=>p.checkingPoint.trim()).map((p,i)=>(
                        <tr key={p.id}><td style={cs.sumTd}>{i+1}</td><td style={{...cs.sumTd,fontWeight:500}}>{p.checkingPoint}</td>
                        <td style={cs.sumTd}>{p.unit||'—'}</td><td style={cs.sumTd}>{p.specification||'—'}</td>
                        <td style={cs.sumTd}>{p.instrumentName||'—'}</td>
                        <td style={cs.sumTd}>{p.toleranceMin||'—'}</td><td style={cs.sumTd}>{p.toleranceMax||'—'}</td></tr>
                      ))}
                    </tbody></table>
                  )}
                </div>)}
              </>)}
            </div>
          </div>

          {/* ═ FOOTER ═ */}
          <div style={{...cs.sec,marginBottom:0}}>
            <div style={cs.ftr}>
              <button type="button" style={cs.btnG} onClick={handleReset}><RefreshCw size={12}/> Reset Form</button>
              <div style={cs.ftrR}>
                <button type="button" style={cs.btnO} onClick={()=>navigate('/admin/component-master')}>Cancel</button>
                <button type="submit" style={{...cs.btnP,opacity:isSubmitting?.7:1}} disabled={isSubmitting}>
                  <Save size={12}/> {isSubmitting?'Saving...':(isEditing?'Update Component':'Save Component')}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>

      <SuccessModal
        show={showSuccess}
        title={isEditing ? 'Component Updated!' : 'Component Created!'}
        message={`${formData.partCode} - ${formData.partName} has been successfully ${isEditing ? 'updated' : 'registered'}.`}
        onClose={() => { setShowSuccess(false); navigate('/admin/component-master'); }}
        onAction={isEditing ? undefined : handleCreateAnother}
        actionLabel="Create Another"
      />
    </div>
  );
};

export default ComponentMasterEntryPage;

