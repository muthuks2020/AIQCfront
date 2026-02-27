import React from 'react';
import { X, Copy, Edit2, Trash2, Loader2 } from 'lucide-react';
import { COMPONENT_API_CONFIG } from '../api/componentMasterApi';
import '../styles/ComponentDetailModal.css';

const ComponentDetailModal = ({
  component,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  loading = false,
}) => {
  if (!isOpen || !component) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'cdm-status-active';
      case 'draft': return 'cdm-status-draft';
      case 'inactive': return 'cdm-status-inactive';
      default: return 'cdm-status-active';
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      mechanical: 'Mechanical',
      electrical: 'Electrical',
      electronics: 'Electronics',
      optical: 'Optical',
      plastic: 'Plastic',
      critical_assembly: 'Critical Assembly',
    };
    return categories[category] || category;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(component);
  };

  const handleDuplicate = () => {
    onDuplicate(component);
  };

  const handleDelete = () => {
    onDelete(component);
  };


  const getSpecifications = () => {
    const specs = [];


    if (component.specifications) {
      Object.entries(component.specifications).forEach(([key, value]) => {
        specs.push({ label: key, value });
      });
    }


    if (component.checkingParameters?.parameters) {
      component.checkingParameters.parameters.forEach((param) => {
        if (param.checkingPoint && param.specification) {
          specs.push({
            label: param.checkingPoint,
            value: param.specification,
            tolerance: param.toleranceMin && param.toleranceMax
              ? `±${Math.abs(parseFloat(param.toleranceMax) - parseFloat(param.specification || 0))}${param.unit || 'mm'}`
              : null
          });
        }
      });
    }


    if (component.material) specs.push({ label: 'Material', value: component.material });
    if (component.length) specs.push({ label: 'Length', value: component.length });
    if (component.dimension) specs.push({ label: 'Dimension', value: component.dimension });
    if (component.type) specs.push({ label: 'Type', value: component.type });
    if (component.resolution) specs.push({ label: 'Resolution', value: component.resolution });
    if (component.color) specs.push({ label: 'Color', value: component.color });
    if (component.input) specs.push({ label: 'Input', value: component.input });
    if (component.tolerance) specs.push({ label: 'Tolerance', value: component.tolerance });

    return specs;
  };

  const specifications = getSpecifications();

  return (
    <div className="cdm-backdrop" onClick={handleBackdropClick}>
      <div className="cdm-modal">
        {}
        <div className="cdm-header">
          <div className="cdm-header-content">
            <h2 className="cdm-title">{component.partName}</h2>
            <p className="cdm-subtitle">
              {component.partCode} • {component.productGroup || 'B-SCAN'}
            </p>
          </div>
          <div className="cdm-header-right">
            <span className={`cdm-status ${getStatusColor(component.status)}`}>
              {component.status || 'Active'}
            </span>
            <button className="cdm-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {}
        <div className="cdm-body">
          {}
          <div className="cdm-section">
            <h3 className="cdm-section-title">Basic Information</h3>
            <div className="cdm-info-grid">
              <div className="cdm-info-item">
                <span className="cdm-info-label">Category</span>
                <span className="cdm-info-value">{getCategoryLabel(component.productCategory)}</span>
              </div>
              <div className="cdm-info-item">
                <span className="cdm-info-label">Vendor</span>
                <span className="cdm-info-value">{component.vendor || 'Not assigned'}</span>
              </div>
              <div className="cdm-info-item">
                <span className="cdm-info-label">QC Plan</span>
                <span className="cdm-info-value">{component.qcPlanNo || component.samplingPlan || 'N/A'}</span>
              </div>
              <div className="cdm-info-item">
                <span className="cdm-info-label">Checkpoints</span>
                <span className="cdm-info-value">
                  {component.checkpoints || component.checkingParameters?.parameters?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {}
          {specifications.length > 0 && (
            <div className="cdm-section">
              <h3 className="cdm-section-title">Specifications</h3>
              <div className="cdm-specs-list">
                {specifications.map((spec, index) => (
                  <div key={index} className="cdm-spec-row">
                    <span className="cdm-spec-label">{spec.label}</span>
                    <span className="cdm-spec-value">
                      {spec.value}
                      {spec.tolerance && <span className="cdm-spec-tolerance">{spec.tolerance}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
         {}
{component.checkingParameters && (
  <div className="cdm-section">
    <h3 className="cdm-section-title">Checking Type</h3>
    <div className="cdm-checking-type">
      {}
      {(() => {
        const type = component.checkingParameters.type;
        const params = component.checkingParameters.parameters || [];


        const isVisual = type === 'visual' || type === 'dimensional_visual';
        const isFunctional = type === 'functional' || type === 'dimensional_visual';
        const isCombined = type === 'dimensional_visual';


        const visualParams = isCombined
          ? params.filter(p => p.instrumentName === 'Visual' || p.type === 'visual')
          : (isVisual ? params : []);
        const functionalParams = isCombined
          ? params.filter(p => p.instrumentName !== 'Visual' && p.type !== 'visual')
          : (isFunctional ? params : []);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isVisual && (
                <span className="cdm-checking-badge" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                  👁 Visual Inspection
                  {isCombined && <span style={{ marginLeft: '6px', opacity: 0.7 }}>({visualParams.length})</span>}
                </span>
              )}
              {isFunctional && (
                <span className="cdm-checking-badge" style={{ background: '#FFF3E0', color: '#E65100' }}>
                  🔧 Functional Testing
                  {isCombined && <span style={{ marginLeft: '6px', opacity: 0.7 }}>({functionalParams.length})</span>}
                </span>
              )}
            </div>
            <span className="cdm-checking-count">
              {params.length} total parameter{params.length !== 1 ? 's' : ''}
              {isCombined && ' (Combined Inspection)'}
            </span>

            {/* Visual Params Table */}
            {isVisual && visualParams.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#1565C0' }}>
                  👁 Visual Inspection Parameters
                </div>
                <table className="cdm-params-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', width: '30px' }}>#</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Checking Point</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Unit</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Specification</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Instrument</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Ref. File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visualParams.map((p, i) => (
                      <tr key={p.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 500 }}>{p.checkingPoint || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.unit || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.specification || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.instrumentName || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>
                          {p.referenceFileName ? (
                            <a
                              href={`${COMPONENT_API_CONFIG.baseUrl}/components/params/${p.id}/reference-file`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#1565C0',
                                fontSize: '12px',
                                textDecoration: 'none',
                              }}
                              title={p.referenceFileName}
                            >
                              📎 {p.referenceFileName.length > 15
                                ? p.referenceFileName.substring(0, 12) + '...'
                                : p.referenceFileName
                              }
                            </a>
                          ) : (
                            <span style={{ color: '#999', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Functional Params Table */}
            {isFunctional && functionalParams.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#E65100' }}>
                  🔧 Functional Testing Parameters
                </div>
                <table className="cdm-params-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', width: '30px' }}>#</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Checking Point</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Specification</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Tol. Min</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Tol. Max</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>Instrument</th>
                    </tr>
                  </thead>
                  <tbody>
                    {functionalParams.map((p, i) => (
                      <tr key={p.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 500 }}>{p.checkingPoint || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.specification || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.toleranceMin || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.toleranceMax || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.instrumentName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  </div>
)}

          {}
          {(component.drawingNo || component.inspectionType || component.prProcessCode) && (
            <div className="cdm-section">
              <h3 className="cdm-section-title">Additional Details</h3>
              <div className="cdm-info-grid">
                {component.drawingNo && (
                  <div className="cdm-info-item">
                    <span className="cdm-info-label">Drawing No.</span>
                    <span className="cdm-info-value">{component.drawingNo}</span>
                  </div>
                )}
                {component.inspectionType && (
                  <div className="cdm-info-item">
                    <span className="cdm-info-label">Inspection Type</span>
                    <span className="cdm-info-value" style={{ textTransform: 'capitalize' }}>
                      {component.inspectionType === '100%' ? '100% Inspection' : 'Sampling'}
                    </span>
                  </div>
                )}
                {component.prProcessCode && (
                  <div className="cdm-info-item">
                    <span className="cdm-info-label">Process Code</span>
                    <span className="cdm-info-value" style={{ textTransform: 'capitalize' }}>
                      {component.prProcessCode.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {(component.lastInspected || component.createdAt || component.updatedAt) && (
            <div className="cdm-section cdm-section-timestamps">
              <div className="cdm-timestamps">
                {component.lastInspected && (
                  <span className="cdm-timestamp">
                    Last inspected: {new Date(component.lastInspected).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                )}
                {component.createdAt && (
                  <span className="cdm-timestamp">
                    Created: {new Date(component.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="cdm-footer">
          <div className="cdm-footer-left">
            <button
              className="cdm-btn cdm-btn-outline cdm-btn-duplicate"
              onClick={handleDuplicate}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="cdm-spin" /> : <Copy size={18} />}
              Duplicate
            </button>
          </div>
          <div className="cdm-footer-right">
            <button
              className="cdm-btn cdm-btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="cdm-btn cdm-btn-primary"
              onClick={handleEdit}
              disabled={loading}
            >
              <Edit2 size={18} />
              Edit Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailModal;
