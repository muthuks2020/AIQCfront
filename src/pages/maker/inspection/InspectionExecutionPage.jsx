import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Loader,
  QrCode,
} from 'lucide-react';
import { colors, shadows, borderRadius, transitions } from '../../../constants/theme';
import { useInspection } from '../../../hooks/useInspection';
import { BatchInfoPanel, InspectionMatrix } from '../../../components/inspection';
import { formatDate } from '../../../utils/helpers';


const LoadingSpinner = () => (
  <div style={styles.loadingContainer}>
    <Loader size={48} style={styles.spinner} />
    <p style={styles.loadingText}>Loading inspection data...</p>
  </div>
);


const ErrorDisplay = ({ message, onRetry }) => (
  <div style={styles.errorContainer}>
    <AlertTriangle size={48} color={colors.danger} />
    <h3 style={styles.errorTitle}>Error Loading Inspection</h3>
    <p style={styles.errorMessage}>{message}</p>
    <button style={styles.retryButton} onClick={onRetry}>
      Try Again
    </button>
  </div>
);


const SuccessModal = ({ data, onClose, onViewReport }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.successModal}>
      <div style={styles.successIcon}>
        <CheckCircle size={64} color={colors.success} />
      </div>
      <h2 style={styles.successTitle}>Inspection Submitted!</h2>
      <p style={styles.successMessage}>
        IR Number: <strong>{data.irNumber}</strong>
      </p>
      <div style={styles.successStats}>
        <div style={styles.successStat}>
          <span style={styles.statLabel}>Pass Rate</span>
          <span style={{ ...styles.statValue, color: colors.success }}>
            {data.result.passRate}%
          </span>
        </div>
        <div style={styles.successStat}>
          <span style={styles.statLabel}>Result</span>
          <span style={{
            ...styles.statValue,
            color: data.result.overallResult === 'Accept Lot'
              ? colors.success
              : colors.danger
          }}>
            {data.result.overallResult}
          </span>
        </div>
      </div>
      <div style={styles.successActions}>
        <button style={styles.primaryButton} onClick={onViewReport}>
          <FileText size={18} />
          View Report
        </button>
        <button style={styles.secondaryButton} onClick={onClose}>
          Back to Queue
        </button>
      </div>
    </div>
  </div>
);


const RemarksSection = ({ value, onChange }) => (
  <div style={styles.remarksSection}>
    <label style={styles.remarksLabel}>Remarks</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter any observations or remarks..."
      style={styles.remarksInput}
      rows={3}
    />
  </div>
);


const InspectionExecutionPage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);


  const {
    loading,
    error,
    batchInfo,
    inspectionForm,
    readings,
    remarks,
    isDirty,
    isSaving,
    isSubmitting,
    lastSaved,
    stats,
    updateReading,
    updateVisualCheck,
    updateRemarks,
    saveProgress,
    submitInspectionData,
    checkpoints,
    sampleSize,
  } = useInspection(inspectionId);


  const handleSaveDraft = async () => {
    const result = await saveProgress();
    if (result.success) {

      console.log('Draft saved successfully');
    } else {
      alert('Failed to save draft: ' + result.error);
    }
  };


  const handleSubmit = async () => {

    if (!stats.isComplete) {
      const confirm = window.confirm(
        `There are ${stats.missingReadings} missing readings. Do you want to continue anyway?`
      );
      if (!confirm) return;
    }

    const result = await submitInspectionData();
    if (result.success) {
      setSubmissionResult(result.data);
      setShowSuccessModal(true);
    } else {
      alert('Failed to submit inspection: ' + result.error);
    }
  };


  const handleBack = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/maker');
  };


  const handleViewReport = () => {
    if (submissionResult?.irNumber) {

      navigate(`/maker/reports/${submissionResult.inspectionId}`);
    }
  };


  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/maker');
  };


  const handleScan = () => {

    console.log('Opening QR scanner...');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <header style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div style={styles.headerInfo}>
            <nav style={styles.breadcrumb}>
              <span>Dashboard</span>
              <span style={styles.breadcrumbSeparator}>&gt;</span>
              <span style={styles.breadcrumbActive}>
                Inspection - {batchInfo?.irNumber || inspectionId}
              </span>
            </nav>
          </div>
        </div>

        <div style={styles.headerRight}>
          {}
          <div style={styles.companyLogo}>
            <img
              src="/logo.png"
              alt="Appasamy Associates"
              style={styles.logoImg}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{ display: 'none' }}>Appasamy Associates</span>
          </div>

          {}
          <div style={styles.headerActions}>
            {}
            {isSaving && (
              <span style={styles.savingIndicator}>
                <Loader size={14} style={styles.savingSpinner} />
                Saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span style={styles.savedIndicator}>
                <CheckCircle size={14} />
                Saved {formatDate(lastSaved, 'time')}
              </span>
            )}

            <button
              style={styles.saveDraftButton}
              onClick={handleSaveDraft}
              disabled={isSaving || !isDirty}
            >
              <Save size={18} />
              Save Draft
            </button>

            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader size={18} style={styles.buttonSpinner} />
              ) : (
                <CheckCircle size={18} />
              )}
              Submit Inspection
            </button>
          </div>
        </div>
      </header>

      {}
      <main style={styles.mainContent}>
        {}
        <aside style={styles.leftPanel}>
          <BatchInfoPanel
            batchInfo={batchInfo}
            onScan={handleScan}
          />
        </aside>

        {}
        <section style={styles.rightPanel}>
          <InspectionMatrix
            checkpoints={checkpoints}
            sampleSize={sampleSize}
            readings={readings}
            stats={stats}
            onUpdateReading={updateReading}
            onUpdateVisualCheck={updateVisualCheck}
          />

          {/* Remarks Section */}
          <RemarksSection
            value={remarks}
            onChange={updateRemarks}
          />

          {}
          <div style={styles.dispositionSection}>
            <div style={styles.dispositionRow}>
              <div style={styles.dispositionItem}>
                <label>Accept Lot</label>
                <input type="checkbox" readOnly checked={stats.failedCheckpoints === 0 && stats.completedCheckpoints > 0} />
              </div>
              <div style={styles.dispositionItem}>
                <label>Reject Lot</label>
                <input type="checkbox" readOnly checked={stats.failedCheckpoints > 0} />
              </div>
              <div style={styles.dispositionItem}>
                <label>Segregate Lot</label>
                <input type="checkbox" readOnly />
              </div>
            </div>
            <div style={styles.qtyRow}>
              <div style={styles.qtyItem}>
                <label>Accepted Qty</label>
                <span>{stats.failedCheckpoints === 0 ? `${batchInfo?.lotSize || 0} Nos` : '-'}</span>
              </div>
              <div style={styles.qtyItem}>
                <label>Rework Qty</label>
                <span>-</span>
              </div>
              <div style={styles.qtyItem}>
                <label>Rejected Qty</label>
                <span>{stats.failedCheckpoints > 0 ? `${batchInfo?.lotSize || 0} Nos` : '-'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {}
      {showSuccessModal && submissionResult && (
        <SuccessModal
          data={submissionResult}
          onClose={handleCloseSuccess}
          onViewReport={handleViewReport}
        />
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: colors.background.secondary,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: colors.background.primary,
    borderBottom: `1px solid ${colors.border.light}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    border: 'none',
    background: colors.neutral[100],
    borderRadius: borderRadius.default,
    cursor: 'pointer',
    color: colors.text.secondary,
    transition: `all ${transitions.fast}`,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: colors.text.tertiary,
  },
  breadcrumbSeparator: {
    color: colors.text.disabled,
  },
  breadcrumbActive: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  companyLogo: {
    height: '32px',
  },
  logoImg: {
    height: '100%',
    width: 'auto',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  savingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: colors.text.tertiary,
  },
  savingSpinner: {
    animation: 'spin 1s linear infinite',
  },
  savedIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: colors.success,
  },
  saveDraftButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: colors.background.primary,
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.default,
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text.secondary,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: colors.primary,
    border: 'none',
    borderRadius: borderRadius.default,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
  buttonSpinner: {
    animation: 'spin 1s linear infinite',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '24px',
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  leftPanel: {
    width: '100%',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  remarksSection: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    padding: '20px 24px',
  },
  remarksLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: '12px',
  },
  remarksInput: {
    width: '100%',
    padding: '12px',
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.default,
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    transition: `border-color ${transitions.fast}`,
    fontFamily: 'inherit',
  },
  dispositionSection: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    padding: '20px 24px',
  },
  dispositionRow: {
    display: 'flex',
    gap: '32px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border.light}`,
  },
  dispositionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: colors.text.secondary,
  },
  qtyRow: {
    display: 'flex',
    gap: '32px',
  },
  qtyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: colors.primary,
  },
  loadingText: {
    fontSize: '16px',
    color: colors.text.secondary,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '24px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  errorMessage: {
    fontSize: '14px',
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: '400px',
  },
  retryButton: {
    padding: '10px 24px',
    background: colors.primary,
    border: 'none',
    borderRadius: borderRadius.default,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  successModal: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: '40px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    boxShadow: shadows.xl,
  },
  successIcon: {
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: colors.text.primary,
    margin: '0 0 12px',
  },
  successMessage: {
    fontSize: '16px',
    color: colors.text.secondary,
    margin: '0 0 24px',
  },
  successStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '32px',
  },
  successStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
  },
  successActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: colors.primary,
    border: 'none',
    borderRadius: borderRadius.default,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
  },
  secondaryButton: {
    padding: '12px 24px',
    background: 'transparent',
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.default,
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text.secondary,
    cursor: 'pointer',
    width: '100%',
  },
};


const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default InspectionExecutionPage;
