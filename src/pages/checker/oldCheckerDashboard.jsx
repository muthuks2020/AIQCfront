import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  User,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileText,
  X,
  MessageSquare,
  RotateCcw,
  Send,
  Loader2,
  Search,
  Calendar,
  Package,
  Hash,
  Shield,
  Info
} from 'lucide-react';
import { Header, Card, StatCard, Button, Badge } from '../../components/common';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';


const checkerApiService = {


  getInspections: async (status = 'all') => {


    return { success: true, data: [] };
  },


  approveInspection: async (inspectionId, payload) => {


    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      data: {
        id: inspectionId,
        status: 'validated',
        checkerName: payload.checkerName,
        checkerDate: new Date().toISOString(),
        remarks: payload.remarks,
      }
    };
  },


  rejectInspection: async (inspectionId, payload) => {


    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      data: {
        id: inspectionId,
        status: 'rejected',
        checkerName: payload.checkerName,
        checkerDate: new Date().toISOString(),
        remarks: payload.remarks,
      }
    };
  },
};


const initialMockValidations = [

  {
    id: "INS-2026-0350",
    jobId: "JOB-AACS-173",
    batchNo: "25-12-002",
    productName: "3PIN GILLARD MALE & FEMALE",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2025-12-27T09:00:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "normal",
    notes: "All checkpoints passed. Visual inspection completed.",
    checkerRemarks: "",
    checkerDate: null,
  },
  {
    id: "RCNA-001",
    jobId: "JOB-RCNA-001",
    batchNo: "26-01-001",
    productName: "CHANNEL FRAME - REGULAR",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-14T09:30:00",
    checkpoints: 20,
    passedCheckpoints: 20,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "high",
    notes: "Comprehensive dimensional inspection completed. All 18 measurement checkpoints within tolerance.",
    checkerRemarks: "",
    checkerDate: null,
  },
  {
    id: "VAL-003",
    jobId: "JOB-RCNA-011",
    batchNo: "26-01-002",
    productName: "CHANNEL CORRUGATED BOX-R",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-09T10:00:00",
    checkpoints: 6,
    passedCheckpoints: 6,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "normal",
    notes: "Packaging material inspection. Dimensions and ply count verified.",
    checkerRemarks: "",
    checkerDate: null,
  },
  {
    id: "VAL-004",
    jobId: "JOB-RCNA-034",
    batchNo: "25-11-001",
    productName: "BEARING-6008",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2025-11-26T09:00:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "normal",
    notes: "Visual inspection for bearing part number and damage check completed.",
    checkerRemarks: "",
    checkerDate: null,
  },
  {
    id: "VAL-005",
    jobId: "JOB-RCNA-035",
    batchNo: "26-01-003",
    productName: "90 DEGREE LOCK & NUT",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-13T09:30:00",
    checkpoints: 10,
    passedCheckpoints: 10,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "high",
    notes: "Precision dimensional inspection completed. All measurements within specified tolerances.",
    checkerRemarks: "",
    checkerDate: null,
  },
  {
    id: "INS-2026-0354",
    jobId: "JOB-RCNA-104",
    batchNo: "25-11-001",
    productName: "EC REP STICKER",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2025-11-13T09:00:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "pending_review",
    priority: "normal",
    notes: "Artwork verification and visual inspection completed.",
    checkerRemarks: "",
    checkerDate: null,
  },


  {
    id: "VAL-007",
    jobId: "JOB-RSFA-061",
    batchNo: "26-01-001",
    productName: "3M.M HD WASHER",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-09T10:30:00",
    checkpoints: 5,
    passedCheckpoints: 5,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Washer dimensional inspection - inner/outer diameter and thickness verified.",
    checkerRemarks: "All measurements verified and within tolerance. Approved.",
    checkerDate: "2026-01-09T14:20:00",
  },
  {
    id: "VAL-008",
    jobId: "JOB-EEWA-029",
    batchNo: "26-01-002",
    productName: "2 CORE WIRE COIL-23/60 T.F.R",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-19T09:00:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Electrical wire coil specification and damage check completed.",
    checkerRemarks: "Wire coil specs verified. Approved for store transfer.",
    checkerDate: "2026-01-19T11:45:00",
  },
  {
    id: "INS-2026-0228",
    jobId: "JOB-EETD-034",
    batchNo: "26-01-003",
    productName: "29V/3A TRANSFORMER",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-13T11:00:00",
    checkpoints: 6,
    passedCheckpoints: 6,
    failedCheckpoints: 0,
    status: "validated",
    priority: "high",
    notes: "Electrical output voltage testing completed. All voltage outputs within tolerance.",
    checkerRemarks: "Output voltages verified independently. All within spec.",
    checkerDate: "2026-01-13T15:30:00",
  },
  {
    id: "INS-2026-0276",
    jobId: "JOB-RUBA-001",
    batchNo: "26-01-001",
    productName: "M.S BASE PLATE",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-14T10:00:00",
    checkpoints: 10,
    passedCheckpoints: 10,
    failedCheckpoints: 0,
    status: "validated",
    priority: "high",
    notes: "Metal base plate dimensional inspection. All measurements verified.",
    checkerRemarks: "Dimensional verification complete. Approved.",
    checkerDate: "2026-01-14T14:00:00",
  },
  {
    id: "VAL-V01",
    jobId: "JOB-RSFA-080",
    batchNo: "26-01-005",
    productName: "RUBBER GASKET O-RING",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-15T08:30:00",
    checkpoints: 4,
    passedCheckpoints: 4,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Dimensional and hardness tests completed. All within spec.",
    checkerRemarks: "Verified. Shore hardness and dimensions OK.",
    checkerDate: "2026-01-15T11:00:00",
  },
  {
    id: "VAL-V02",
    jobId: "JOB-EEWA-044",
    batchNo: "26-01-006",
    productName: "POWER CABLE 3-PIN 6A",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-16T09:00:00",
    checkpoints: 5,
    passedCheckpoints: 5,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Continuity and insulation resistance tests passed.",
    checkerRemarks: "Electrical safety parameters verified. Approved.",
    checkerDate: "2026-01-16T12:30:00",
  },
  {
    id: "VAL-V03",
    jobId: "JOB-EETD-050",
    batchNo: "26-01-007",
    productName: "LED INDICATOR PANEL GREEN",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-17T10:00:00",
    checkpoints: 4,
    passedCheckpoints: 4,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Visual and functional check of LED indicators completed.",
    checkerRemarks: "All LEDs functional. Brightness within range.",
    checkerDate: "2026-01-17T13:15:00",
  },
  {
    id: "VAL-V04",
    jobId: "JOB-AACS-200",
    batchNo: "26-01-008",
    productName: "ALUMINIUM BRACKET L-TYPE",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-18T08:45:00",
    checkpoints: 8,
    passedCheckpoints: 8,
    failedCheckpoints: 0,
    status: "validated",
    priority: "high",
    notes: "All 8 dimensional parameters checked. Within tolerance.",
    checkerRemarks: "Critical dimensions verified. Surface finish acceptable.",
    checkerDate: "2026-01-18T14:00:00",
  },
  {
    id: "VAL-V05",
    jobId: "JOB-RCNA-120",
    batchNo: "26-01-009",
    productName: "NYLON SPACER 6MM",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-20T09:30:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Dimensional check completed for nylon spacers.",
    checkerRemarks: "Dimensions OK. Approved.",
    checkerDate: "2026-01-20T11:00:00",
  },
  {
    id: "VAL-V06",
    jobId: "JOB-EEWA-055",
    batchNo: "26-01-010",
    productName: "FUSE HOLDER 5A PANEL MOUNT",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-21T10:00:00",
    checkpoints: 4,
    passedCheckpoints: 4,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Contact resistance and fitment tests passed.",
    checkerRemarks: "Tested and verified. Approved for store.",
    checkerDate: "2026-01-21T13:30:00",
  },
  {
    id: "VAL-V07",
    jobId: "JOB-RSFA-090",
    batchNo: "26-01-011",
    productName: "SPRING TENSION 4.5N",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-22T08:00:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Tension force measurement within 4.3–4.7N range.",
    checkerRemarks: "Force values verified. Within spec.",
    checkerDate: "2026-01-22T10:30:00",
  },
  {
    id: "VAL-V08",
    jobId: "JOB-EETD-070",
    batchNo: "26-01-012",
    productName: "CAPACITOR 470UF 25V",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-23T09:15:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Capacitance and ESR measured. All within datasheet limits.",
    checkerRemarks: "Electrical parameters OK. Approved.",
    checkerDate: "2026-01-23T11:45:00",
  },
  {
    id: "VAL-V09",
    jobId: "JOB-AACS-210",
    batchNo: "26-01-013",
    productName: "SCREW M4X12 SS304",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-24T10:30:00",
    checkpoints: 4,
    passedCheckpoints: 4,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Thread gauge and dimensional check completed.",
    checkerRemarks: "Thread and dimension verified. Approved.",
    checkerDate: "2026-01-24T13:00:00",
  },
  {
    id: "VAL-V10",
    jobId: "JOB-RCNA-130",
    batchNo: "26-01-014",
    productName: "PLASTIC KNOB 25MM DIA",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-25T08:30:00",
    checkpoints: 3,
    passedCheckpoints: 3,
    failedCheckpoints: 0,
    status: "validated",
    priority: "normal",
    notes: "Visual and dimensional inspection completed.",
    checkerRemarks: "No defects. Dimensions within tolerance.",
    checkerDate: "2026-01-25T10:15:00",
  },


  {
    id: "REJ-001",
    jobId: "JOB-EETD-045",
    batchNo: "26-01-004",
    productName: "PCB CONTROL BOARD V2.1",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-20T09:00:00",
    checkpoints: 12,
    passedCheckpoints: 9,
    failedCheckpoints: 3,
    status: "rejected",
    priority: "high",
    notes: "3 of 12 checkpoints failed — solder joint defects found on IC U3 and U7.",
    checkerRemarks: "Solder defects confirmed upon visual re-check. Returning to maker for re-inspection. IC U3 pin 4 cold joint, U7 bridge on pins 12-13.",
    checkerDate: "2026-01-20T14:30:00",
  },
  {
    id: "REJ-002",
    jobId: "JOB-RCNA-099",
    batchNo: "26-01-005",
    productName: "HOUSING COVER - PLASTIC",
    maker: "Radhakrishnan.S",
    makerDept: "QC Department",
    submittedAt: "2026-01-22T10:00:00",
    checkpoints: 8,
    passedCheckpoints: 6,
    failedCheckpoints: 2,
    status: "rejected",
    priority: "normal",
    notes: "Dimensional mismatch on snap-fit tabs. 2 checkpoints failed.",
    checkerRemarks: "Tab thickness out of tolerance by 0.3mm. Cannot assemble with base plate. Return to maker — vendor issue likely.",
    checkerDate: "2026-01-22T15:00:00",
  },
];


const RejectModal = ({ inspection, onConfirm, onCancel, isProcessing }) => {
  const [remarks, setRemarks] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleConfirm = () => {
    if (remarks.trim().length < 10) return;
    onConfirm(remarks.trim());
  };

  return (
    <div style={modalStyles.overlay} onClick={onCancel}>
      <div style={modalStyles.container} onClick={e => e.stopPropagation()}>
        {}
        <div style={modalStyles.header}>
          <div style={modalStyles.headerIcon}>
            <XCircle size={24} color={colors.danger} />
          </div>
          <div>
            <h3 style={modalStyles.title}>Reject & Return to Maker</h3>
            <p style={modalStyles.subtitle}>{inspection.productName} — {inspection.batchNo}</p>
          </div>
          <button style={modalStyles.closeBtn} onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {}
        <div style={modalStyles.infoBanner}>
          <Info size={16} color={colors.warning} />
          <span>This inspection will be returned to the QC Maker for re-inspection. A rejection reason is required.</span>
        </div>

        {}
        <div style={modalStyles.body}>
          <label style={modalStyles.label}>
            <MessageSquare size={16} />
            Rejection Reason <span style={{ color: colors.danger }}>*</span>
          </label>
          <textarea
            ref={textareaRef}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Describe the reason for rejection (min. 10 characters)..."
            style={modalStyles.textarea}
            rows={4}
            disabled={isProcessing}
          />
          <div style={modalStyles.charCount}>
            <span style={{ color: remarks.trim().length >= 10 ? colors.success : colors.neutral[400] }}>
              {remarks.trim().length} / 10 min characters
            </span>
          </div>
        </div>

        {}
        <div style={modalStyles.actions}>
          <button style={modalStyles.cancelBtn} onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.rejectBtn,
              opacity: remarks.trim().length < 10 || isProcessing ? 0.5 : 1,
              cursor: remarks.trim().length < 10 || isProcessing ? 'not-allowed' : 'pointer',
            }}
            onClick={handleConfirm}
            disabled={remarks.trim().length < 10 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <RotateCcw size={16} />
                Reject & Return to Maker
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const ApproveModal = ({ inspection, onConfirm, onCancel, isProcessing }) => {
  const [remarks, setRemarks] = useState('');

  return (
    <div style={modalStyles.overlay} onClick={onCancel}>
      <div style={modalStyles.container} onClick={e => e.stopPropagation()}>
        {}
        <div style={{ ...modalStyles.header, borderBottomColor: `${colors.success}20` }}>
          <div style={{ ...modalStyles.headerIcon, background: `${colors.success}15` }}>
            <CheckCircle2 size={24} color={colors.success} />
          </div>
          <div>
            <h3 style={modalStyles.title}>Approve Inspection</h3>
            <p style={modalStyles.subtitle}>{inspection.productName} — {inspection.batchNo}</p>
          </div>
          <button style={modalStyles.closeBtn} onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {}
        <div style={{ ...modalStyles.infoBanner, background: `${colors.success}08`, borderColor: `${colors.success}20` }}>
          <CheckCircle2 size={16} color={colors.success} />
          <span>This inspection will be approved and moved to the Validated tab. The maker will be notified.</span>
        </div>

        {}
        <div style={modalStyles.body}>
          <label style={modalStyles.label}>
            <MessageSquare size={16} />
            Remarks <span style={{ color: colors.neutral[400], fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional comments..."
            style={modalStyles.textarea}
            rows={3}
            disabled={isProcessing}
          />
        </div>

        {}
        <div style={modalStyles.actions}>
          <button style={modalStyles.cancelBtn} onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.approveBtn,
              opacity: isProcessing ? 0.5 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
            onClick={() => onConfirm(remarks.trim())}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <ThumbsUp size={16} />
                Approve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? colors.success : type === 'error' ? colors.danger : colors.warning;
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : AlertTriangle;

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 10000,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px', borderRadius: 12,
      background: 'white', border: `1px solid ${bg}30`,
      boxShadow: `0 8px 30px ${bg}25`,
      animation: 'toastSlideIn 0.3s ease',
      maxWidth: 420,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${bg}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={bg} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: colors.neutral[800], flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: colors.neutral[400],
      }}>
        <X size={16} />
      </button>
    </div>
  );
};


const ValidationCard = ({ validation, onApprove, onReject, onViewDetails }) => {
  const passRate = validation.checkpoints > 0
    ? Math.round((validation.passedCheckpoints / validation.checkpoints) * 100)
    : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: undefined });
  };

  const getPriorityStyle = () => {
    if (validation.priority === 'high') return { bg: `${colors.danger}10`, color: colors.danger, label: 'High' };
    return { bg: `${colors.neutral[100]}`, color: colors.neutral[500], label: 'Normal' };
  };

  const priorityStyle = getPriorityStyle();

  return (
    <div style={cardStyles.container}>
      {}
      <div style={cardStyles.topRow}>
        <span style={{
          ...cardStyles.priorityBadge,
          background: priorityStyle.bg,
          color: priorityStyle.color,
        }}>
          {priorityStyle.label}
        </span>

        {}
        {validation.status === 'validated' && (
          <span style={{ ...cardStyles.statusBadge, background: `${colors.success}10`, color: colors.success }}>
            <CheckCircle2 size={14} /> Validated
          </span>
        )}
        {validation.status === 'rejected' && (
          <span style={{ ...cardStyles.statusBadge, background: `${colors.danger}10`, color: colors.danger }}>
            <XCircle size={14} /> Rejected
          </span>
        )}

        <span style={cardStyles.date}>Submitted {formatDate(validation.submittedAt)}</span>
      </div>

      {}
      <h3 style={cardStyles.productName}>{validation.productName}</h3>
      <div style={cardStyles.metaRow}>
        <span style={cardStyles.metaItem}>
          <Hash size={14} /> Batch: {validation.batchNo}
        </span>
        <span style={cardStyles.metaItem}>
          <User size={14} /> {validation.maker}
        </span>
      </div>

      {}
      <div style={cardStyles.notes}>
        <span style={cardStyles.notesLabel}>Notes:</span> {validation.notes}
      </div>

      {}
      {validation.checkerRemarks && (validation.status === 'validated' || validation.status === 'rejected') && (
        <div style={{
          ...cardStyles.checkerRemarks,
          background: validation.status === 'rejected' ? `${colors.danger}06` : `${colors.success}06`,
          borderColor: validation.status === 'rejected' ? `${colors.danger}15` : `${colors.success}15`,
        }}>
          <span style={{
            ...cardStyles.checkerRemarksLabel,
            color: validation.status === 'rejected' ? colors.danger : colors.success,
          }}>
            <MessageSquare size={13} />
            Checker Remarks:
          </span>
          <span style={cardStyles.checkerRemarksText}>{validation.checkerRemarks}</span>
          {validation.checkerDate && (
            <span style={cardStyles.checkerDate}>
              <Calendar size={12} /> {new Date(validation.checkerDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at {new Date(validation.checkerDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {}
      <div style={cardStyles.bottomRow}>
        {}
        <div style={cardStyles.passRateSection}>
          <div style={{
            ...cardStyles.passRateCircle,
            borderColor: passRate === 100 ? colors.success : passRate >= 80 ? colors.warning : colors.danger,
            color: passRate === 100 ? colors.success : passRate >= 80 ? colors.warning : colors.danger,
          }}>
            <span style={cardStyles.passRateValue}>{passRate}%</span>
            <span style={cardStyles.passRateLabel}>Pass Rate</span>
          </div>
          <div style={cardStyles.checkpointCounts}>
            <span style={{ color: colors.success, fontSize: 13 }}>
              <CheckCircle2 size={13} /> {validation.passedCheckpoints} Passed
            </span>
            <span style={{ color: validation.failedCheckpoints > 0 ? colors.danger : colors.neutral[400], fontSize: 13 }}>
              <XCircle size={13} /> {validation.failedCheckpoints} Failed
            </span>
          </div>
        </div>

        {}
        <div style={cardStyles.actions}>
          {validation.status === 'rejected' && (
            <span style={cardStyles.returnedBadge}>
              <RotateCcw size={14} /> Sent back to Maker
            </span>
          )}

          <button style={cardStyles.viewBtn} onClick={() => onViewDetails(validation.id)}>
            <Eye size={16} /> View Details
          </button>

          {validation.status === 'pending_review' && (
            <>
              <button style={cardStyles.rejectBtn} onClick={() => onReject(validation)}>
                <ThumbsDown size={16} /> Reject
              </button>
              <button style={cardStyles.approveBtn} onClick={() => onApprove(validation)}>
                <ThumbsUp size={16} /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const SummaryItem = ({ icon: Icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 13, color: colors.neutral[500] }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: colors.neutral[800] }}>{value}</div>
    </div>
  </div>
);


const CheckerDashboard = () => {
  const { user } = useAuth();
  const [validations, setValidations] = useState(initialMockValidations);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(false);


  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);


  const counts = {
    pending: validations.filter(v => v.status === 'pending_review').length,
    validated: validations.filter(v => v.status === 'validated').length,
    rejected: validations.filter(v => v.status === 'rejected').length,
  };


  const filteredValidations = validations.filter(v => {
    const matchesTab = selectedTab === 'pending' ? v.status === 'pending_review'
      : selectedTab === 'validated' ? v.status === 'validated'
      : selectedTab === 'rejected' ? v.status === 'rejected'
      : true;

    const matchesSearch = !searchQuery ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.maker.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });


  const handleApprove = useCallback(async (remarks) => {
    if (!approveTarget) return;
    setProcessing(true);

    try {
      const result = await checkerApiService.approveInspection(approveTarget.id, {
        remarks: remarks || 'Approved by checker.',
        checkerName: user?.name || 'Priya Sharma',
        checkerId: user?.employeeId || 'EMP023',
      });

      if (result.success) {

        setValidations(prev => prev.map(v =>
          v.id === approveTarget.id
            ? {
                ...v,
                status: 'validated',
                checkerRemarks: remarks || 'Approved by checker.',
                checkerDate: new Date().toISOString(),
              }
            : v
        ));
        setToast({ message: `✓ "${approveTarget.productName}" approved and moved to Validated`, type: 'success' });
        setApproveTarget(null);
      }
    } catch (err) {
      setToast({ message: 'Failed to approve. Please try again.', type: 'error' });
    } finally {
      setProcessing(false);
    }
  }, [approveTarget, user]);


  const handleReject = useCallback(async (remarks) => {
    if (!rejectTarget) return;
    setProcessing(true);

    try {
      const result = await checkerApiService.rejectInspection(rejectTarget.id, {
        remarks,
        checkerName: user?.name || 'Priya Sharma',
        checkerId: user?.employeeId || 'EMP023',
      });

      if (result.success) {

        setValidations(prev => prev.map(v =>
          v.id === rejectTarget.id
            ? {
                ...v,
                status: 'rejected',
                checkerRemarks: remarks,
                checkerDate: new Date().toISOString(),
              }
            : v
        ));
        setToast({ message: `"${rejectTarget.productName}" rejected and returned to Maker`, type: 'warning' });
        setRejectTarget(null);
      }
    } catch (err) {
      setToast({ message: 'Failed to reject. Please try again.', type: 'error' });
    } finally {
      setProcessing(false);
    }
  }, [rejectTarget, user]);

  const handleViewDetails = (validationId) => {
    window.location.href = `/checker/review/${validationId}`;
  };


  const stats = [
    { label: 'Pending Review', value: String(counts.pending), change: `+${Math.min(counts.pending, 2)} today`, icon: ListChecks, color: colors.roles?.checker?.primary || '#059669' },
    { label: 'Validated Today', value: String(counts.validated), change: '+25% vs avg', icon: CheckCircle2, color: colors.success },
    { label: 'Rejected', value: String(counts.rejected), change: 'This week', icon: XCircle, color: colors.danger },
    { label: 'Avg. Review Time', value: '18 min', change: '-5 min', icon: Clock, color: colors.primary },
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: counts.pending, icon: ListChecks },
    { id: 'validated', label: 'Validated', count: counts.validated, icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected', count: counts.rejected, icon: XCircle },
  ];

  return (
    <div style={styles.page}>
      <Header
        title="QC Validation Center"
        subtitle={`Welcome, ${user?.name || 'Validator'}! Review and validate QC inspections.`}
        showSearch
      />

      <div style={styles.content}>
        {}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {}
        <section style={styles.section}>
          {}
          <div style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  style={{
                    ...styles.tab,
                    borderBottomColor: isActive
                      ? (tab.id === 'rejected' ? colors.danger : tab.id === 'validated' ? colors.success : (colors.roles?.checker?.primary || '#059669'))
                      : 'transparent',
                    color: isActive
                      ? (tab.id === 'rejected' ? colors.danger : tab.id === 'validated' ? colors.success : (colors.roles?.checker?.primary || '#059669'))
                      : colors.neutral[500],
                  }}
                >
                  <TabIcon size={16} />
                  {tab.label}
                  <span style={{
                    ...styles.tabCount,
                    background: isActive
                      ? (tab.id === 'rejected' ? `${colors.danger}15` : tab.id === 'validated' ? `${colors.success}15` : (colors.roles?.checker?.light || `${colors.success}15`))
                      : colors.neutral[100],
                    color: isActive
                      ? (tab.id === 'rejected' ? colors.danger : tab.id === 'validated' ? colors.success : (colors.roles?.checker?.primary || '#059669'))
                      : colors.neutral[600],
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {}
          <div style={styles.searchRow}>
            <div style={styles.searchInput}>
              <Search size={16} color={colors.neutral[400]} />
              <input
                type="text"
                placeholder="Search by product, batch, ID, or maker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchField}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.searchClear}>
                  <X size={14} />
                </button>
              )}
            </div>
            <span style={styles.resultCount}>
              {filteredValidations.length} item{filteredValidations.length !== 1 ? 's' : ''}
            </span>
          </div>

          {}
          <div style={styles.validationsList}>
            {filteredValidations.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  {selectedTab === 'pending' ? <ListChecks size={48} /> : selectedTab === 'validated' ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                </div>
                <h3 style={styles.emptyTitle}>
                  {searchQuery ? 'No results found' : `No ${selectedTab === 'pending' ? 'pending' : selectedTab} items`}
                </h3>
                <p style={styles.emptyText}>
                  {searchQuery ? 'Try a different search term.' : selectedTab === 'pending' ? 'All inspections have been reviewed!' : `No ${selectedTab} inspections yet.`}
                </p>
              </div>
            ) : (
              filteredValidations.map((validation) => (
                <ValidationCard
                  key={validation.id}
                  validation={validation}
                  onApprove={(v) => setApproveTarget(v)}
                  onReject={(v) => setRejectTarget(v)}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </section>

        {}
        <div style={styles.summaryRow}>
          <Card>
            <h3 style={styles.cardTitle}>Today's Summary</h3>
            <div style={styles.summaryStats}>
              <SummaryItem
                icon={CheckCircle2}
                label="Approved"
                value={String(counts.validated)}
                color={colors.success}
              />
              <SummaryItem
                icon={XCircle}
                label="Rejected"
                value={String(counts.rejected)}
                color={colors.danger}
              />
              <SummaryItem
                icon={AlertTriangle}
                label="Pending"
                value={String(counts.pending)}
                color={colors.warning}
              />
            </div>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Top Makers This Week</h3>
            <div style={styles.makersList}>
              {[
                { name: 'Radhakrishnan.S', count: 18, rate: '100%' },
                { name: 'Anand Krishnan', count: 12, rate: '97%' },
                { name: 'Ravi Kumar', count: 8, rate: '95%' },
              ].map((maker, idx) => (
                <div key={idx} style={styles.makerItem}>
                  <div style={styles.makerAvatar}>
                    {maker.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.neutral[800] }}>{maker.name}</div>
                    <div style={{ fontSize: 12, color: colors.neutral[500] }}>{maker.count} inspections</div>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: colors.success,
                    background: `${colors.success}10`,
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    {maker.rate}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* === MODALS === */}
      {approveTarget && (
        <ApproveModal
          inspection={approveTarget}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
          isProcessing={processing}
        />
      )}

      {rejectTarget && (
        <RejectModal
          inspection={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          isProcessing={processing}
        />
      )}

      {/* === TOAST === */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Keyframe Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = {
  page: {
    minHeight: '100vh',
    background: colors.neutral[50],
  },
  content: {
    padding: '24px 32px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 28,
  },
  section: {
    background: 'white',
    borderRadius: 12,
    boxShadow: shadows.card,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    padding: '0 24px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px 20px',
    fontSize: 15,
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabCount: {
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    transition: 'all 0.2s ease',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${colors.neutral[200]}`,
    background: colors.neutral[50],
  },
  searchField: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: colors.neutral[800],
  },
  searchClear: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.neutral[400],
    padding: 2,
  },
  resultCount: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  validationsList: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    color: colors.neutral[300],
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.neutral[600],
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[400],
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.neutral[800],
    marginBottom: 16,
  },
  summaryStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  makersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  makerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },
  makerAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: `${colors.primary}15`,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  },
};


// Card styles
const cardStyles = {
  container: {
    background: 'white',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 14,
    padding: '20px 24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  priorityBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
  },
  date: {
    fontSize: 13,
    color: colors.neutral[400],
    marginLeft: 'auto',
  },
  productName: {
    fontSize: 17,
    fontWeight: 700,
    color: colors.neutral[800],
    margin: '0 0 8px',
  },
  metaRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 10,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    color: colors.neutral[500],
  },
  notes: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 1.5,
    padding: '10px 14px',
    background: colors.neutral[50],
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontWeight: 600,
    color: colors.neutral[700],
  },
  checkerRemarks: {
    fontSize: 13,
    lineHeight: 1.5,
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  checkerRemarksLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  checkerRemarksText: {
    color: colors.neutral[700],
  },
  checkerDate: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  passRateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  passRateCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passRateValue: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1,
  },
  passRateLabel: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    opacity: 0.7,
  },
  checkpointCounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    borderRadius: 10,
    border: `1px solid ${colors.neutral[200]}`,
    background: 'white',
    color: colors.neutral[600],
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 10,
    border: `1px solid ${colors.danger}40`,
    background: 'white',
    color: colors.danger,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: colors.success,
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  returnedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: `${colors.warning}12`,
    border: `1px solid ${colors.warning}30`,
    color: colors.warningDark || '#D97706',
    fontSize: 13,
    fontWeight: 600,
  },
};


// Modal styles
const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  container: {
    background: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: `${colors.danger}10`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.neutral[800],
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    margin: '2px 0 0',
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.neutral[400],
    padding: 4,
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    margin: '16px 24px 0',
    padding: '12px 14px',
    borderRadius: 10,
    background: `${colors.warning}08`,
    border: `1px solid ${colors.warning}20`,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 1.5,
  },
  body: {
    padding: '16px 24px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: colors.neutral[700],
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1px solid ${colors.neutral[200]}`,
    fontSize: 14,
    color: colors.neutral[800],
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    transition: 'border-color 0.15s ease',
  },
  charCount: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: `1px solid ${colors.neutral[100]}`,
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: `1px solid ${colors.neutral[200]}`,
    background: 'white',
    color: colors.neutral[600],
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: colors.danger,
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: colors.success,
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};


export default CheckerDashboard;
