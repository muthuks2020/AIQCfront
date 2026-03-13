/**
 * QcPlanFileUpload.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable file-upload widget for attaching a reference document to any
 * record (currently: Quality Plan).  Supports:
 *
 *   • New record  (planId = null)  → stores the file locally and calls
 *     onPendingFile(file).  The parent uploads it after the record is saved.
 *
 *   • Existing record (planId set) → calls uploadFn(planId, file) immediately.
 *
 *   • Edit with existing file       → shows file metadata + Re-upload / Delete.
 *
 * Accepted types : JPG, JPEG, GIF, PDF
 * Max size       : 5 MB
 *
 * Props
 * ─────
 *  planId           {number|null}  — null = new record (pending mode)
 *  initialDocument  {object|null}  — {id, originalName, fileSize, mimeType,
 *                                      uploadedAt, uploadedBy}  pre-loaded doc
 *  onPendingFile    {Function}     — (file|null) => void  (pending mode only)
 *  onUploadSuccess  {Function}     — (fileData) => void   (after server upload)
 *  onDeleteSuccess  {Function}     — () => void           (after server delete)
 *  uploadFn         {Function}     — async (planId, file) => { data }
 *  deleteFn         {Function}     — async (planId, docId) => void
 *  disabled         {boolean}
 *  label            {string}
 *  required         {boolean}
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, Image as ImageIcon, Trash2, RefreshCw,
  CheckCircle, AlertCircle, Loader, Clock, User, HardDrive, Download,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS  = ['.jpg', '.jpeg', '.gif', '.pdf'];
const ALLOWED_MIME_TYPES  = ['image/jpeg', 'image/gif', 'application/pdf'];
const MAX_SIZE_MB          = 5;
const MAX_SIZE_BYTES       = MAX_SIZE_MB * 1024 * 1024;

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const getFileIcon = (mimeType, fileName) => {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'gif'].includes(ext)) {
    return <ImageIcon size={20} />;
  }
  return <FileText size={20} />;
};

const validateFile = (file) => {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Invalid file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is ${MAX_SIZE_MB} MB`;
  }
  return null; // valid
};


// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrapper: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  label: {
    fontSize: '13px', fontWeight: '600',
    color: '#374151', display: 'flex', alignItems: 'center', gap: '4px',
  },
  required: { color: '#EF4444' },
  optional: { fontSize: '11px', color: '#9CA3AF', fontWeight: '400' },

  // ── Upload zone ──
  dropzone: (isDragging, hasError, disabled) => ({
    position: 'relative',
    border: `2px dashed ${hasError ? '#EF4444' : isDragging ? '#3B82F6' : '#D1D5DB'}`,
    borderRadius: '10px',
    padding: '28px 20px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: isDragging ? '#EFF6FF'
              : hasError   ? '#FEF2F2'
              : disabled   ? '#F9FAFB'
              : '#FAFAFA',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
  }),
  hiddenInput: {
    position: 'absolute', inset: 0, opacity: 0,
    cursor: 'pointer', width: '100%', height: '100%',
  },
  uploadIcon: {
    width: '48px', height: '48px',
    margin: '0 auto 12px',
    background: 'white',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3B82F6',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  uploadText: { fontSize: '14px', color: '#374151', marginBottom: '4px' },
  uploadHint: { fontSize: '12px', color: '#9CA3AF' },

  // ── File preview card ──
  card: (variant) => ({
    border: `1px solid ${
      variant === 'pending'  ? '#FBBF24'
    : variant === 'success'  ? '#10B981'
    : variant === 'error'    ? '#EF4444'
    : '#E5E7EB'
    }`,
    borderRadius: '10px',
    padding: '14px 16px',
    background: variant === 'pending' ? '#FFFBEB'
              : variant === 'success' ? '#F0FDF4'
              : variant === 'error'   ? '#FEF2F2'
              : '#F9FAFB',
  }),
  cardTop: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  iconBox: (color) => ({
    width: '40px', height: '40px', flexShrink: 0,
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: color + '20', color: color,
  }),
  cardBody: { flex: 1, minWidth: 0 },
  fileName: {
    fontSize: '13px', fontWeight: '600',
    color: '#111827',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  fileMeta: {
    display: 'flex', flexWrap: 'wrap', gap: '10px',
    marginTop: '4px',
  },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#6B7280',
  },
  badge: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '2px 8px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
    background: color + '20', color: color,
    marginTop: '6px',
  }),
  actions: {
    display: 'flex', gap: '8px', marginTop: '10px',
  },
  btn: (variant) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '6px', border: 'none',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...(variant === 'danger' ? {
      background: '#FEF2F2', color: '#DC2626',
    } : {
      background: '#EFF6FF', color: '#2563EB',
    }),
  }),
  errorText: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#EF4444', marginTop: '4px',
  },

  // ── Uploading overlay ──
  uploading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '20px', border: '1px solid #BFDBFE',
    borderRadius: '10px', background: '#EFF6FF',
    fontSize: '13px', color: '#2563EB', fontWeight: '500',
  },
};


// =============================================================================
// Component
// =============================================================================
const QcPlanFileUpload = ({
  planId           = null,
  initialDocument  = null,   // pre-loaded doc from server (edit mode)
  onPendingFile    = null,
  onUploadSuccess  = null,   // called after a successful server upload
  onDeleteSuccess  = null,   // called after a successful server delete
  uploadFn         = null,
  deleteFn         = null,
  disabled         = false,
  label            = 'Reference Document',
  required         = false,
}) => {
  const [isDragging,   setIsDragging]   = useState(false);
  const [pendingFile,  setPendingFile]  = useState(null);          // File obj (new plan)
  const [serverFile,   setServerFile]   = useState(initialDocument); // doc shown from server
  const [uploadState,  setUploadState]  = useState('idle');        // idle|uploading|deleting
  const [errorMsg,     setErrorMsg]     = useState('');
  const inputRef = useRef(null);

  // ── Sync when parent loads initialDocument asynchronously (edit mode) ──
  // The page calls fetchQualityPlanById then sets planDocument via setState,
  // which re-renders with a new initialDocument value. We need to pick that up.
  useEffect(() => {
    if (!initialDocument) { setServerFile(null); return; }
    setServerFile({
      ...initialDocument,
      // Normalise snake_case API fields → camelCase used in the render
      originalName: initialDocument.originalName || initialDocument.original_name,
      fileSize:     initialDocument.fileSize     || initialDocument.file_size,
      mimeType:     initialDocument.mimeType     || initialDocument.mime_type,
      uploadedAt:   initialDocument.uploadedAt   || initialDocument.uploaded_at,
      uploadedBy:   initialDocument.uploadedBy   || initialDocument.uploaded_by,
      downloadUrl:  initialDocument.downloadUrl  || initialDocument.download_url,
    });
  }, [initialDocument]);

  // ── Derived display state ──
  const localFile   = pendingFile;
  const isUploading = uploadState === 'uploading';
  const isDeleting  = uploadState === 'deleting';
  const isBusy      = isUploading || isDeleting;

  // ── Process a file (validate → store or upload) ──────────────────────────
  const processFile = async (file) => {
    setErrorMsg('');
    const err = validateFile(file);
    if (err) { setErrorMsg(err); return; }

    if (!planId) {
      // ── New plan: hold locally until parent saves the plan ──
      setPendingFile(file);
      onPendingFile?.(file);
      return;
    }

    // ── Existing plan: upload to server immediately ──
    setUploadState('uploading');
    try {
      const result = await uploadFn(planId, file);
      const raw = result?.data || result;
      // Normalise download_url → downloadUrl for consistent internal use
      const uploaded = raw ? { ...raw, downloadUrl: raw.downloadUrl || raw.download_url } : raw;
      setServerFile(uploaded);      // update internal state → widget shows new file
      setPendingFile(null);
      setUploadState('idle');
      onUploadSuccess?.(uploaded);
    } catch (e) {
      setUploadState('idle');
      setErrorMsg(e.message || 'Upload failed. Please try again.');
    }
  };

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isBusy) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ── Input change ─────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = ''; // reset so same file can trigger onChange again
  };

  // ── Remove pending (new-plan mode) ───────────────────────────────────────
  const handleRemovePending = () => {
    setPendingFile(null);
    setErrorMsg('');
    onPendingFile?.(null);
  };

  // ── Delete server file ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!serverFile || !planId) return;
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setErrorMsg('');
    setUploadState('deleting');
    try {
      await deleteFn(planId, serverFile.id);
      setServerFile(null);          // clear internal state → widget shows drop zone
      setUploadState('idle');
      onDeleteSuccess?.();
    } catch (e) {
      setUploadState('idle');
      setErrorMsg(e.message || 'Delete failed. Please try again.');
    }
  };

  // ── Trigger re-upload ────────────────────────────────────────────────────
  const handleReplace = () => {
    setErrorMsg('');
    inputRef.current?.click();
  };

  // ── Download: open the direct file URL in a new tab — no auth needed ──────
  const handleDownload = () => {
    if (!serverFile) return;
    const url = serverFile.downloadUrl || serverFile.download_url;
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };


  // ==========================================================================
  // Render
  // ==========================================================================

  // ── Uploading spinner ─────────────────────────────────────────────────────
  if (isUploading) {
    return (
      <div style={S.wrapper}>
        <label style={S.label}>
          {label}{required && <span style={S.required}>*</span>}
        </label>
        <div style={S.uploading}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Uploading document…
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Deleting spinner ─────────────────────────────────────────────────────
  if (isDeleting) {
    return (
      <div style={S.wrapper}>
        <label style={S.label}>
          {label}{required && <span style={S.required}>*</span>}
        </label>
        <div style={{ ...S.uploading, background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Deleting document…
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── File preview card: server file ───────────────────────────────────────
  if (serverFile) {
    const hasDownload = !!(serverFile.downloadUrl || serverFile.download_url);
    return (
      <div style={S.wrapper}>
        <label style={S.label}>
          {label}{required && <span style={S.required}>*</span>}
        </label>

        <div style={S.card('server')}>
          <div style={S.cardTop}>
            <div style={S.iconBox('#10B981')}>
              {getFileIcon(serverFile.mimeType, serverFile.originalName)}
            </div>
            <div style={S.cardBody}>
              {/* ── File name ── */}
              <div style={{
                ...S.fileName,
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '4px',
              }}>
                {serverFile.originalName || '(unnamed file)'}
              </div>

              {/* ── Meta row ── */}
              <div style={S.fileMeta}>
                <span style={S.metaItem}>
                  <HardDrive size={11} />{formatFileSize(serverFile.fileSize)}
                </span>
                {serverFile.uploadedAt && (
                  <span style={S.metaItem}>
                    <Clock size={11} />{formatDate(serverFile.uploadedAt)}
                  </span>
                )}
                {serverFile.uploadedBy && (
                  <span style={S.metaItem}>
                    <User size={11} />{serverFile.uploadedBy}
                  </span>
                )}
              </div>

              <span style={S.badge('#10B981')}>
                <CheckCircle size={10} /> Active document
              </span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={S.actions}>
            {/* Download — always visible when URL is available */}
            {hasDownload && (
              <button
                type="button"
                style={{
                  ...S.btn('primary'),
                  background: '#F0FDF4',
                  color: '#16A34A',
                }}
                onClick={handleDownload}
                title={`Download ${serverFile.originalName || 'file'}`}
              >
                <Download size={12} /> Download
              </button>
            )}

            {!disabled && (
              <>
                <button type="button" style={S.btn('primary')} onClick={handleReplace}>
                  <RefreshCw size={12} /> Re-upload
                </button>
                <button type="button" style={S.btn('danger')} onClick={handleDelete}>
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {errorMsg && (
          <div style={S.errorText}>
            <AlertCircle size={12} />{errorMsg}
          </div>
        )}
      </div>
    );
  }

  // ── File preview card: pending (new plan, not yet saved) ─────────────────
  if (localFile) {
    return (
      <div style={S.wrapper}>
        <label style={S.label}>
          {label}{required && <span style={S.required}>*</span>}
        </label>

        <div style={S.card('pending')}>
          <div style={S.cardTop}>
            <div style={S.iconBox('#F59E0B')}>
              {getFileIcon(localFile.type, localFile.name)}
            </div>
            <div style={S.cardBody}>
              <div style={S.fileName}>{localFile.name}</div>
              <div style={S.fileMeta}>
                <span style={S.metaItem}>
                  <HardDrive size={11} />{formatFileSize(localFile.size)}
                </span>
              </div>
              <span style={S.badge('#F59E0B')}>
                <Clock size={10} /> Pending — will upload when plan is saved
              </span>
            </div>
          </div>

          {!disabled && (
            <div style={S.actions}>
              <button type="button" style={S.btn('primary')} onClick={() => inputRef.current?.click()}>
                <RefreshCw size={12} /> Change file
              </button>
              <button type="button" style={S.btn('danger')} onClick={handleRemovePending}>
                <Trash2 size={12} /> Remove
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={S.errorText}>
            <AlertCircle size={12} />{errorMsg}
          </div>
        )}
      </div>
    );
  }

  // ── Empty drop zone ───────────────────────────────────────────────────────
  return (
    <div style={S.wrapper}>
      <label style={S.label}>
        {label}
        {required
          ? <span style={S.required}>*</span>
          : <span style={S.optional}>(Optional)</span>
        }
      </label>

      <div
        style={S.dropzone(isDragging, !!errorMsg, disabled)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!disabled && (
          <input
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleInputChange}
            style={S.hiddenInput}
            disabled={disabled}
          />
        )}

        <div style={S.uploadIcon}>
          <Upload size={22} />
        </div>
        <p style={S.uploadText}>
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p style={S.uploadHint}>
          JPG, JPEG, GIF or PDF &nbsp;·&nbsp; Max {MAX_SIZE_MB} MB
        </p>
      </div>

      {errorMsg && (
        <div style={S.errorText}>
          <AlertCircle size={12} />{errorMsg}
        </div>
      )}
    </div>
  );
};

export default QcPlanFileUpload;
