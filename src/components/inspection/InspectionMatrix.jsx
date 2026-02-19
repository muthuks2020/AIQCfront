import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  Ruler,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { colors, shadows, borderRadius, transitions } from '../../constants/theme';
import { validateReading } from '../../api/inspectionService';


const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    passed: { bg: colors.inspection.passedBg, color: colors.inspection.passed, icon: CheckCircle },
    failed: { bg: colors.inspection.failedBg, color: colors.inspection.failed, icon: XCircle },
    pending: { bg: colors.inspection.pendingBg, color: colors.inspection.pending, icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div style={{
      ...styles.statusBadge,
      background: config.bg,
      color: config.color,
    }}>
      <Icon size={14} />
      <span>{count}</span>
      <span style={styles.statusLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};


const MeasurementInput = ({
  checkpoint,
  sampleNumber,
  value,
  status,
  onChange,
  onKeyDown,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Allow empty, or numbers with max 2 decimal places
    if (inputValue === '' || /^-?\d*\.?\d{0,2}$/.test(inputValue)) {
      onChange(inputValue === '' ? null : parseFloat(inputValue));
    }
  };

  const getBorderColor = () => {
    if (isFocused) return colors.primary;
    if (status === 'pass') return colors.success;
    if (status === 'fail') return colors.danger;
    return colors.border.light;
  };

  const getBackgroundColor = () => {
    if (status === 'pass') return colors.successBg;
    if (status === 'fail') return colors.dangerBg;
    return colors.background.primary;
  };

  return (
    <div style={styles.inputWrapper}>
      <input
        type="text"
        inputMode="decimal"
        value={value !== null && value !== undefined ? value : ''}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        placeholder={checkpoint.unit || '-'}
        data-checkpoint={checkpoint.id}
        data-sample={sampleNumber}
        style={{
          ...styles.measurementInput,
          borderColor: getBorderColor(),
          background: getBackgroundColor(),
        }}
      />
    </div>
  );
};


const SampleChip = ({ number, value, onClick }) => {
  const getChipStyle = () => {
    if (value === 'OK') return styles.chipOK;
    if (value === 'NG') return styles.chipNG;
    return styles.chipPending;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.chip, ...getChipStyle() }}
      title={`Sample ${number}: ${value || 'Pending'} — Click to toggle`}
    >
      {number}
    </button>
  );
};


const VisualCheckCard = ({
  checkpoint,
  sampleSize,
  readings,
  onUpdateVisualCheck,
}) => {
  const checkpointReadings = readings?.readings || {};
  const result = readings?.result || 'Pending';
  const isQtyCheck = checkpoint.qtyCheck;


  const counts = useMemo(() => {
    let ok = 0, ng = 0, pending = 0;
    for (let i = 1; i <= sampleSize; i++) {
      const val = checkpointReadings[i]?.value;
      if (val === 'OK') ok++;
      else if (val === 'NG') ng++;
      else pending++;
    }
    return { ok, ng, pending };
  }, [checkpointReadings, sampleSize]);


  const handleChipClick = (sampleNumber) => {
    const current = checkpointReadings[sampleNumber]?.value;
    let next;
    if (!current) next = 'OK';
    else if (current === 'OK') next = 'NG';
    else next = 'OK';
    onUpdateVisualCheck(checkpoint.id, sampleNumber, next);
  };


  const handleMarkAll = (value) => {
    for (let i = 1; i <= sampleSize; i++) {
      onUpdateVisualCheck(checkpoint.id, i, value);
    }
  };

  const handleReset = () => {
    for (let i = 1; i <= sampleSize; i++) {
      onUpdateVisualCheck(checkpoint.id, i, null);
    }
  };

  const getResultStyle = () => {
    if (result === 'Accepted') return { bg: colors.successBg, color: colors.success, icon: ShieldCheck };
    if (result === 'Rejected') return { bg: colors.dangerBg, color: colors.danger, icon: ShieldAlert };
    return { bg: colors.neutral[100], color: colors.text.tertiary, icon: AlertCircle };
  };

  const resultStyle = getResultStyle();
  const ResultIcon = resultStyle.icon;


  const completedPercent = Math.round(((counts.ok + counts.ng) / sampleSize) * 100);

  return (
    <div style={{
      ...styles.visualCard,
      borderLeft: `4px solid ${counts.ng > 0 ? colors.danger : counts.ok === sampleSize ? colors.success : colors.neutral[300]}`,
    }}>
      {}
      <div style={styles.visualCardTop}>
        <div style={styles.visualCardLeft}>
          <div style={styles.visualCardHeader}>
            <Eye size={16} color={colors.text.tertiary} />
            <span style={styles.visualCardName}>{checkpoint.name}</span>
            <span style={styles.visualInstrumentTag}>Visual</span>
          </div>
          <span style={styles.visualCardSpec}>{checkpoint.specification}</span>
        </div>

        {}
        <div style={styles.counterRow}>
          <div style={{ ...styles.counterBadge, background: colors.successBg, color: colors.success }}>
            <CheckCircle size={12} />
            <span>{counts.ok} OK</span>
          </div>
          {counts.ng > 0 && (
            <div style={{ ...styles.counterBadge, background: colors.dangerBg, color: colors.danger }}>
              <XCircle size={12} />
              <span>{counts.ng} NG</span>
            </div>
          )}
          <div style={{ ...styles.counterBadge, background: colors.neutral[100], color: colors.text.tertiary }}>
            <span>{counts.pending} left</span>
          </div>
        </div>

        {}
        <div style={{
          ...styles.visualResultBadge,
          background: resultStyle.bg,
          color: resultStyle.color,
        }}>
          <ResultIcon size={14} />
          <span>{result}</span>
        </div>
      </div>

      {}
      {isQtyCheck ? (
        <div style={styles.qtyCheckRow}>
          <div style={styles.qtyCheckBadge}>
            <CheckCircle size={16} color={colors.success} />
            <span>Quantity verification — batch level check</span>
          </div>
          <div style={styles.bulkActions}>
            <button type="button" onClick={() => handleMarkAll('OK')} style={styles.bulkBtnOK}>
              <CheckCircle size={14} /> Mark Verified
            </button>
          </div>
        </div>
      ) : (
        <>
          {}
          <div style={styles.progressBarContainer}>
            <div style={styles.progressBarTrack}>
              <div style={{
                ...styles.progressBarFill,
                width: `${completedPercent}%`,
                background: counts.ng > 0
                  ? `linear-gradient(90deg, ${colors.success} ${(counts.ok / (counts.ok + counts.ng)) * 100}%, ${colors.danger} ${(counts.ok / (counts.ok + counts.ng)) * 100}%)`
                  : colors.success,
              }} />
            </div>
            <span style={styles.progressText}>{completedPercent}%</span>
          </div>

          {}
          <div style={styles.bulkActions}>
            <button type="button" onClick={() => handleMarkAll('OK')} style={styles.bulkBtnOK}>
              <CheckCircle size={14} /> All OK
            </button>
            <button type="button" onClick={() => handleMarkAll('NG')} style={styles.bulkBtnNG}>
              <XCircle size={14} /> All NG
            </button>
            <button type="button" onClick={handleReset} style={styles.bulkBtnReset}>
              <RotateCcw size={14} /> Reset
            </button>
            <span style={styles.bulkHint}>Click individual chips to toggle</span>
          </div>

          {}
          <div style={styles.chipGrid}>
            {[...Array(sampleSize)].map((_, i) => {
              const sampleNumber = i + 1;
              const val = checkpointReadings[sampleNumber]?.value || null;
              return (
                <SampleChip
                  key={sampleNumber}
                  number={sampleNumber}
                  value={val}
                  onClick={() => handleChipClick(sampleNumber)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


const FunctionalCheckpointRow = ({
  checkpoint,
  sampleSize,
  readings,
  onUpdateReading,
  onViewParameters,
}) => {
  const checkpointReadings = readings?.readings || {};
  const result = readings?.result || 'Pending';

  const getResultBadge = () => {
    if (result === 'Accepted') {
      return <span style={{ ...styles.resultBadge, ...styles.resultAccepted }}>Accepted</span>;
    }
    if (result === 'Rejected') {
      return <span style={{ ...styles.resultBadge, ...styles.resultRejected }}>Rejected</span>;
    }
    return <span style={{ ...styles.resultBadge, ...styles.resultPending }}>Pending</span>;
  };

  const handleKeyDown = (e, sampleNumber) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      const nextSample = sampleNumber + 1;
      if (nextSample <= sampleSize) {
        const nextInput = document.querySelector(
          `[data-checkpoint="${checkpoint.id}"][data-sample="${nextSample}"]`
        );
        nextInput?.focus();
      }
    }
  };

  return (
    <tr style={styles.checkpointRow}>
      <td style={styles.checkpointCell}>
        <div style={styles.checkpointInfo}>
          <div style={styles.checkpointHeader}>
            <span style={styles.checkpointName}>{checkpoint.name}</span>
            <span style={styles.instrumentTag}>{checkpoint.instrument}</span>
          </div>
          <button
            style={styles.qcParamsLink}
            onClick={() => onViewParameters(checkpoint)}
          >
            <FileText size={12} />
            QC Parameters
            <ExternalLink size={10} />
          </button>
        </div>
      </td>
      <td style={styles.specCell}>
        <div style={styles.specValue}>
          <span style={styles.specNominal}>{checkpoint.nominalValue}{checkpoint.unit}</span>
          <span style={styles.specTolerance}>±{checkpoint.tolerancePlus}{checkpoint.unit}</span>
        </div>
      </td>
      {[...Array(sampleSize)].map((_, index) => {
        const sampleNumber = index + 1;
        const reading = checkpointReadings[sampleNumber] || {};
        return (
          <td key={sampleNumber} style={styles.sampleCell}>
            <MeasurementInput
              checkpoint={checkpoint}
              sampleNumber={sampleNumber}
              value={reading.value}
              status={reading.status}
              onChange={(value) => onUpdateReading(checkpoint.id, sampleNumber, value)}
              onKeyDown={(e) => handleKeyDown(e, sampleNumber)}
            />
          </td>
        );
      })}
      <td style={styles.resultCell}>{getResultBadge()}</td>
    </tr>
  );
};


const QCParametersModal = ({ checkpoint, onClose }) => {
  if (!checkpoint) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>QC Parameters</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.paramGroup}>
            <label style={styles.paramLabel}>Checkpoint</label>
            <span style={styles.paramValue}>{checkpoint.name}</span>
          </div>
          <div style={styles.paramGroup}>
            <label style={styles.paramLabel}>Specification</label>
            <span style={styles.paramValue}>{checkpoint.specification}</span>
          </div>
          <div style={styles.paramRow}>
            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Nominal Value</label>
              <span style={styles.paramValue}>{checkpoint.nominalValue} {checkpoint.unit}</span>
            </div>
            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Tolerance</label>
              <span style={styles.paramValue}>±{checkpoint.tolerancePlus} {checkpoint.unit}</span>
            </div>
          </div>
          <div style={styles.paramRow}>
            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Min Value</label>
              <span style={{ ...styles.paramValue, color: colors.danger }}>
                {checkpoint.minValue} {checkpoint.unit}
              </span>
            </div>
            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Max Value</label>
              <span style={{ ...styles.paramValue, color: colors.success }}>
                {checkpoint.maxValue} {checkpoint.unit}
              </span>
            </div>
          </div>
          <div style={styles.paramGroup}>
            <label style={styles.paramLabel}>Instrument</label>
            <span style={styles.paramValue}>{checkpoint.instrument}</span>
          </div>
          {checkpoint.instrumentId && (
            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Instrument ID</label>
              <span style={styles.paramValue}>{checkpoint.instrumentId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const InspectionMatrix = ({
  checkpoints,
  sampleSize,
  readings,
  stats,
  onUpdateReading,
  onUpdateVisualCheck,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

  const functionalChecks = checkpoints.filter(cp => cp.type === 'functional');
  const visualChecks = checkpoints.filter(cp => cp.type === 'visual');

  const hasFunctional = functionalChecks.length > 0;
  const hasVisual = visualChecks.length > 0;

  const sampleHeaders = [...Array(sampleSize)].map((_, i) => `S${i + 1}`);

  return (
    <div style={styles.container}>
      {}
      <div style={styles.header}>
        <h2 style={styles.title}>Inspection Matrix</h2>
        <div style={styles.statsRow}>
          <StatusBadge status="passed" count={stats.passedCheckpoints} />
          <StatusBadge status="failed" count={stats.failedCheckpoints} />
          <div style={styles.passRate}>
            {stats.passRate}% Pass
          </div>
        </div>
      </div>

      {}
      {hasFunctional && (
        <div style={styles.sectionWrapper}>
          <div style={styles.sectionHeader}>
            <Ruler size={16} color={colors.primary} />
            <span style={styles.sectionTitle}>Measurement Checks</span>
            <span style={styles.sectionCount}>{functionalChecks.length} checkpoints · {sampleSize} samples</span>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={{ ...styles.th, ...styles.checkpointTh }}>Checkpoint</th>
                  <th style={{ ...styles.th, ...styles.specTh }}>Spec</th>
                  {sampleHeaders.map((header) => (
                    <th key={header} style={{ ...styles.th, ...styles.sampleTh }}>{header}</th>
                  ))}
                  <th style={{ ...styles.th, ...styles.resultTh }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {functionalChecks.map((checkpoint) => (
                  <FunctionalCheckpointRow
                    key={checkpoint.id}
                    checkpoint={checkpoint}
                    sampleSize={sampleSize}
                    readings={readings[checkpoint.id]}
                    onUpdateReading={onUpdateReading}
                    onViewParameters={setSelectedCheckpoint}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {hasVisual && (
        <div style={styles.sectionWrapper}>
          <div style={styles.sectionHeader}>
            <Eye size={16} color={colors.info} />
            <span style={styles.sectionTitle}>Visual Checks</span>
            <span style={styles.sectionCount}>{visualChecks.length} checkpoints · {sampleSize} samples each</span>
          </div>
          <div style={styles.visualCardsContainer}>
            {visualChecks.map((checkpoint) => (
              <VisualCheckCard
                key={checkpoint.id}
                checkpoint={checkpoint}
                sampleSize={sampleSize}
                readings={readings[checkpoint.id]}
                onUpdateVisualCheck={onUpdateVisualCheck}
              />
            ))}
          </div>
        </div>
      )}

      {}
      {selectedCheckpoint && (
        <QCParametersModal
          checkpoint={selectedCheckpoint}
          onClose={() => setSelectedCheckpoint(null)}
        />
      )}
    </div>
  );
};


const styles = {
  container: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.border.light}`,
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: borderRadius.full,
    fontSize: '13px',
    fontWeight: '500',
  },
  statusLabel: {
    marginLeft: '2px',
  },
  passRate: {
    padding: '6px 16px',
    background: colors.neutral[100],
    borderRadius: borderRadius.full,
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.primary,
  },


  sectionWrapper: {
    borderBottom: `1px solid ${colors.border.light}`,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: colors.neutral[50],
    borderBottom: `1px solid ${colors.border.light}`,
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: '12px',
    color: colors.text.tertiary,
    marginLeft: 'auto',
  },


  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  headerRow: {
    background: colors.neutral[50],
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${colors.border.light}`,
  },
  checkpointTh: { textAlign: 'left', width: '200px', minWidth: '200px' },
  specTh: { width: '100px', minWidth: '100px' },
  sampleTh: { width: '80px', minWidth: '80px' },
  resultTh: { width: '100px', minWidth: '100px' },
  checkpointRow: {
    borderBottom: `1px solid ${colors.border.light}`,
    transition: `background ${transitions.fast}`,
  },
  checkpointCell: { padding: '12px 16px', verticalAlign: 'top' },
  checkpointInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  checkpointHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  checkpointName: { fontSize: '14px', fontWeight: '500', color: colors.text.primary },
  instrumentTag: {
    fontSize: '11px',
    padding: '2px 6px',
    background: colors.neutral[100],
    borderRadius: borderRadius.sm,
    color: colors.text.tertiary,
  },
  qcParamsLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: colors.infoBg,
    border: 'none',
    borderRadius: borderRadius.sm,
    fontSize: '11px',
    color: colors.info,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    width: 'fit-content',
  },
  specCell: { padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' },
  specValue: { display: 'flex', flexDirection: 'column', gap: '2px' },
  specNominal: { fontSize: '14px', fontWeight: '500', color: colors.text.primary },
  specTolerance: { fontSize: '11px', color: colors.text.tertiary },
  sampleCell: { padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' },
  inputWrapper: { display: 'flex', justifyContent: 'center' },
  measurementInput: {
    width: '64px',
    padding: '8px',
    border: `1.5px solid ${colors.border.light}`,
    borderRadius: borderRadius.default,
    fontSize: '13px',
    textAlign: 'center',
    outline: 'none',
    transition: `all ${transitions.fast}`,
  },
  resultCell: { padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' },
  resultBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: borderRadius.full,
    fontSize: '12px',
    fontWeight: '500',
  },
  resultAccepted: { background: colors.successBg, color: colors.success },
  resultRejected: { background: colors.dangerBg, color: colors.danger },
  resultPending: { background: colors.neutral[100], color: colors.text.tertiary },


  visualCardsContainer: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  visualCard: {
    background: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.default,
    padding: '0',
    overflow: 'hidden',
    transition: `all ${transitions.default}`,
  },
  visualCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    flexWrap: 'wrap',
    background: colors.neutral[50],
    borderBottom: `1px solid ${colors.border.light}`,
  },
  visualCardLeft: {
    flex: '1 1 220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '180px',
  },
  visualCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  visualCardName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary,
  },
  visualInstrumentTag: {
    fontSize: '11px',
    padding: '2px 8px',
    background: colors.infoBg,
    borderRadius: borderRadius.full,
    color: colors.info,
    fontWeight: '500',
  },
  visualCardSpec: {
    fontSize: '12px',
    color: colors.text.secondary,
    paddingLeft: '24px',
  },
  counterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  counterBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: borderRadius.full,
    fontSize: '12px',
    fontWeight: '600',
  },
  visualResultBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: borderRadius.full,
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },


  qtyCheckRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  qtyCheckBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: colors.text.secondary,
  },


  progressBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 20px 4px 20px',
  },
  progressBarTrack: {
    flex: 1,
    height: '6px',
    background: colors.neutral[200],
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: `width ${transitions.default}`,
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.text.secondary,
    minWidth: '35px',
    textAlign: 'right',
  },


  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    flexWrap: 'wrap',
  },
  bulkBtnOK: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 14px',
    border: `1.5px solid ${colors.success}`,
    borderRadius: borderRadius.default,
    background: colors.successBg,
    fontSize: '12px',
    fontWeight: '600',
    color: colors.success,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
  bulkBtnNG: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 14px',
    border: `1.5px solid ${colors.danger}`,
    borderRadius: borderRadius.default,
    background: colors.dangerBg,
    fontSize: '12px',
    fontWeight: '600',
    color: colors.danger,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
  bulkBtnReset: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 14px',
    border: `1.5px solid ${colors.border.light}`,
    borderRadius: borderRadius.default,
    background: colors.background.primary,
    fontSize: '12px',
    fontWeight: '500',
    color: colors.text.tertiary,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
  bulkHint: {
    fontSize: '11px',
    color: colors.text.tertiary,
    marginLeft: '8px',
    fontStyle: 'italic',
  },


  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '8px 20px 16px 20px',
  },
  chip: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.default,
    border: '2px solid transparent',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    userSelect: 'none',
    lineHeight: 1,
  },
  chipPending: {
    background: colors.neutral[100],
    borderColor: colors.neutral[300],
    color: colors.text.tertiary,
  },
  chipOK: {
    background: colors.successBg,
    borderColor: colors.success,
    color: colors.success,
  },
  chipNG: {
    background: colors.dangerBg,
    borderColor: colors.danger,
    color: colors.danger,
  },


  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: '480px',
    boxShadow: shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.border.light}`,
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  modalClose: {
    padding: '4px 8px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: colors.text.tertiary,
    cursor: 'pointer',
    lineHeight: 1,
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  paramGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  paramRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  paramLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  paramValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text.primary,
  },
};

export default InspectionMatrix;
