import React from 'react';
import {
  Package,
  FileText,
  Calendar,
  Building2,
  Layers,
  QrCode,
  ClipboardList
} from 'lucide-react';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { formatDateIndian } from '../../utils/helpers';


const InfoItem = ({ label, value, icon: Icon }) => (
  <div style={styles.infoItem}>
    <span style={styles.infoLabel}>
      {Icon && <Icon size={14} style={styles.labelIcon} />}
      {label}
    </span>
    <span style={styles.infoValue}>{value || '-'}</span>
  </div>
);


const SectionDivider = () => <div style={styles.divider} />;

const BatchInfoPanel = ({ batchInfo, onScan }) => {
  if (!batchInfo) {
    return (
      <div style={styles.container}>
        <div style={styles.skeleton}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Batch Information</h2>
        {onScan && (
          <button style={styles.scanButton} onClick={onScan}>
            <QrCode size={16} />
            Scan
          </button>
        )}
      </div>

      {/* IR & PO Information */}
      <div style={styles.section}>
        <InfoItem
          label="IR Number"
          value={batchInfo.irNumber}
          icon={FileText}
        />
        <InfoItem
          label="IR Date"
          value={formatDateIndian(batchInfo.irDate)}
          icon={Calendar}
        />
      </div>

      <SectionDivider />

      {/* PO Information */}
      <div style={styles.section}>
        <InfoItem
          label="PO Number"
          value={batchInfo.poNumber}
          icon={FileText}
        />
        <InfoItem
          label="PO Date"
          value={formatDateIndian(batchInfo.poDate)}
          icon={Calendar}
        />
      </div>

      <SectionDivider />

      {/* GRN Information */}
      <div style={styles.section}>
        <InfoItem
          label="GRN Number"
          value={batchInfo.grnNumber}
        />
        <InfoItem
          label="GRN Date"
          value={formatDateIndian(batchInfo.grnDate)}
        />
      </div>

      <SectionDivider />

      {/* Component Information */}
      <div style={styles.section}>
        <InfoItem
          label="Part Code"
          value={batchInfo.partCode}
          icon={Package}
        />
        <InfoItem
          label="Part Name"
          value={batchInfo.partName}
        />
      </div>

      <SectionDivider />

      {/* Vendor Information */}
      <div style={styles.section}>
        <InfoItem
          label="Supplier"
          value={typeof batchInfo.vendor === 'object'
            ? batchInfo.vendor.name
            : batchInfo.vendor}
          icon={Building2}
        />
        {batchInfo.vendorDcNo && (
          <InfoItem
            label="Vendor DC No"
            value={batchInfo.vendorDcNo}
          />
        )}
      </div>

      <SectionDivider />

      {/* Quantity Information */}
      <div style={styles.section}>
        <InfoItem
          label="Lot Size"
          value={`${batchInfo.lotSize} Nos`}
          icon={Layers}
        />
        <InfoItem
          label="Sample Size"
          value={`${batchInfo.sampleSize} Nos`}
        />
      </div>

      <SectionDivider />

      {/* Plan Information */}
      <div style={styles.section}>
        <InfoItem
          label="Quality Plan No"
          value={batchInfo.qualityPlanNo}
          icon={ClipboardList}
        />
        <InfoItem
          label="Sampling Plan"
          value={batchInfo.samplingPlanNo}
        />
        {batchInfo.batchNo && (
          <InfoItem
            label="Batch No"
            value={batchInfo.batchNo}
          />
        )}
      </div>

      {/* Document Reference */}
      {batchInfo.documentRef && (
        <div style={styles.footer}>
          <span style={styles.docRef}>{batchInfo.documentRef}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    padding: '24px',
    height: 'fit-content',
    position: 'sticky',
    top: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  scanButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: colors.neutral[100],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.default,
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text.secondary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text.secondary,
  },
  labelIcon: {
    opacity: 0.6,
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
    maxWidth: '60%',
    wordBreak: 'break-word',
  },
  divider: {
    height: '1px',
    background: colors.border.light,
    margin: '16px 0',
  },
  footer: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: `1px dashed ${colors.border.light}`,
    textAlign: 'center',
  },
  docRef: {
    fontSize: '11px',
    fontWeight: '500',
    color: colors.text.muted,
    letterSpacing: '0.5px',
  },
  skeleton: {
    padding: '40px',
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: '14px',
  },
};

export default BatchInfoPanel;
