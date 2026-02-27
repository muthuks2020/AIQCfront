/**
 * =============================================================================
 * TestCertificateUpload.jsx
 * =============================================================================
 * Compact inline upload widget for test certificates under each checkpoint.
 * Place at: src/components/inspection/TestCertificateUpload.jsx
 * =============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader,
  Trash2,
} from 'lucide-react';
import {
  uploadTestCertificate,
  getTestCertificates,
  deleteTestCertificate,
} from '../../api/inspectionService';
import { API_CONFIG } from '../../api/config';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.pdf';
const MAX_SIZE_MB = 10;

const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  success: '#10B981',
  successBg: '#ECFDF5',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  bg: '#F9FAFB',
};

const s = {
  wrapper: {
    padding: '12px 20px',
    borderTop: '1px dashed #E5E7EB',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  dropZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    border: '1.5px dashed #E5E7EB',
    borderRadius: '8px',
    background: colors.bg,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  dropZoneHover: {
    borderColor: colors.primary,
    background: colors.primaryLight,
  },
  dropZoneDragging: {
    borderColor: colors.info,
    background: colors.infoBg,
  },
  dropIcon: {
    color: colors.textTertiary,
    flexShrink: 0,
  },
  dropText: {
    fontSize: '13px',
    color: colors.textSecondary,
    lineHeight: '1.3',
  },
  dropHint: {
    fontSize: '11px',
    color: colors.textTertiary,
  },
  hiddenInput: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  fileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: colors.successBg,
    border: `1.5px solid ${colors.success}`,
    borderRadius: '8px',
  },
  fileIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  fileMeta: {
    fontSize: '11px',
    color: colors.textTertiary,
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '2px',
  },
  fileActions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  actionBtn: {
    width: '30px',
    height: '30px',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  uploading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: colors.infoBg,
    border: `1.5px solid ${colors.info}`,
    borderRadius: '8px',
  },
  uploadingText: {
    fontSize: '13px',
    color: colors.info,
    fontWeight: '500',
  },
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: colors.dangerBg,
    border: `1px solid ${colors.danger}`,
    borderRadius: '6px',
    fontSize: '12px',
    color: colors.danger,
    marginTop: '6px',
  },
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const TestCertificateUpload = ({
  inspectionId,
  checkpointId,
  checkpointType,
  checkpointName = '',
}) => {
  const [certificate, setCertificate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const replaceInputRef = useRef(null);

  // Load existing certificate on mount
  useEffect(() => {
    if (!inspectionId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await getTestCertificates(inspectionId);
        const certs = res.data || res || [];
        const match = certs.find(
          (c) =>
            c.checkpoint_id === Number(checkpointId) &&
            c.checkpoint_type === checkpointType
        );
        if (!cancelled && match) {
          setCertificate(match);
        }
      } catch (err) {
        console.warn('Failed to load test certificates:', err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [inspectionId, checkpointId, checkpointType]);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError(null);

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
        setError('Only JPG, PNG, or PDF files are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Maximum ${MAX_SIZE_MB}MB.`);
        return;
      }

      setUploading(true);
      try {
        const res = await uploadTestCertificate(
          inspectionId, file, checkpointId, checkpointType, checkpointName
        );
        setCertificate(res.data || res);
      } catch (err) {
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [inspectionId, checkpointId, checkpointType, checkpointName]
  );

  const handleDelete = useCallback(async () => {
    if (!certificate?.id) return;
    if (!window.confirm('Remove this test certificate?')) return;

    try {
      await deleteTestCertificate(certificate.id);
      setCertificate(null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  }, [certificate]);

  const handleDownload = useCallback(() => {
    if (!certificate?.id) return;
    const url = `${API_CONFIG.baseUrl}/inspection/test-certificates/${certificate.id}/download`;
    window.open(url, '_blank');
  }, [certificate]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const FileIcon = certificate?.mime_type?.startsWith('image/') ? ImageIcon : FileText;
  const fileIconStyle = certificate?.mime_type?.startsWith('image/')
    ? { background: '#DBEAFE', color: '#3B82F6' }
    : { background: '#FEE2E2', color: '#EF4444' };

  // --- Uploading state ---
  if (uploading) {
    return (
      <div style={s.wrapper}>
        <div style={s.label}><Upload size={12} /> Test Certificate</div>
        <div style={s.uploading}>
          <Loader size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={s.uploadingText}>Uploading...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- Has certificate ---
  if (certificate) {
    return (
      <div style={s.wrapper}>
        <div style={s.label}><CheckCircle size={12} color={colors.success} /> Test Certificate</div>
        <div style={s.fileCard}>
          <div style={{ ...s.fileIcon, ...fileIconStyle }}>
            <FileIcon size={18} />
          </div>
          <div style={s.fileInfo}>
            <span style={s.fileName} title={certificate.original_name}>
              {certificate.original_name}
            </span>
            <div style={s.fileMeta}>
              <span>{formatSize(certificate.file_size)}</span>
              {certificate.uploaded_by && <span>by {certificate.uploaded_by}</span>}
            </div>
          </div>
          <div style={s.fileActions}>
            <button type="button"
              style={{ ...s.actionBtn, background: colors.infoBg, color: colors.info }}
              onClick={handleDownload} title="Download">
              <Download size={14} />
            </button>
            <button type="button"
              style={{ ...s.actionBtn, background: colors.warningBg, color: colors.warning }}
              onClick={() => replaceInputRef.current?.click()} title="Replace">
              <RefreshCw size={14} />
            </button>
            <input ref={replaceInputRef} type="file" accept={ACCEPTED_TYPES}
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }} />
            <button type="button"
              style={{ ...s.actionBtn, background: colors.dangerBg, color: colors.danger }}
              onClick={handleDelete} title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {error && <div style={s.errorBar}><AlertCircle size={12} />{error}</div>}
      </div>
    );
  }

  // --- No certificate — drop zone ---
  return (
    <div style={s.wrapper}>
      <div style={s.label}><Upload size={12} /> Test Certificate</div>
      <div
        style={{
          ...s.dropZone,
          ...(isDragging ? s.dropZoneDragging : {}),
          ...(isHovered && !isDragging ? s.dropZoneHover : {}),
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input type="file" accept={ACCEPTED_TYPES} style={s.hiddenInput}
          onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }} />
        <Upload size={18} style={s.dropIcon} />
        <div>
          <div style={s.dropText}><strong>Upload</strong> test certificate</div>
          <div style={s.dropHint}>JPG, PNG or PDF · max {MAX_SIZE_MB}MB</div>
        </div>
      </div>
      {error && <div style={s.errorBar}><AlertCircle size={12} />{error}</div>}
    </div>
  );
};

export default TestCertificateUpload;
