import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, ListChecks, CheckCircle2, XCircle, AlertTriangle,
  Clock, TrendingUp, User, ChevronRight, ThumbsUp, ThumbsDown, Eye,
  FileText, ArrowLeft, Shield, ShieldCheck, ShieldAlert, Clipboard,
  Package, Calendar, Hash, Ruler, Gauge, RotateCcw, Send, MessageSquare,
  ChevronDown, ChevronUp, Filter, Search, X, Download, Printer,
  AlertCircle, Info, CheckCircle, Loader2, Microscope, Activity,
  BarChart3, RefreshCw, Zap, ArrowRight, MoreVertical, Bookmark
} from "lucide-react";


const colors = {
  primary: "#0066FF", primaryDark: "#0052CC", primaryLight: "#3384FF",
  primaryBg: "rgba(0, 102, 255, 0.08)",
  success: "#10B981", successDark: "#059669", successLight: "#34D399",
  successBg: "rgba(16, 185, 129, 0.1)",
  warning: "#F59E0B", warningDark: "#D97706", warningLight: "#FBBF24",
  warningBg: "rgba(245, 158, 11, 0.1)",
  danger: "#EF4444", dangerDark: "#DC2626", dangerLight: "#F87171",
  dangerBg: "rgba(239, 68, 68, 0.1)",
  info: "#3B82F6", infoDark: "#2563EB", infoLight: "#60A5FA",
  infoBg: "rgba(59, 130, 246, 0.1)",
  neutral: {
    50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB", 300: "#D1D5DB",
    400: "#9CA3AF", 500: "#6B7280", 600: "#4B5563", 700: "#374151",
    800: "#1F2937", 900: "#111827",
  },
  background: { primary: "#FFFFFF", secondary: "#F9FAFB", tertiary: "#F3F4F6" },
  text: { primary: "#111827", secondary: "#4B5563", tertiary: "#6B7280", disabled: "#9CA3AF", inverse: "#FFFFFF" },
  border: { light: "#E5E7EB", default: "#D1D5DB", dark: "#9CA3AF" },
  roles: {
    checker: { primary: "#10B981", light: "rgba(16, 185, 129, 0.1)" },
    maker: { primary: "#0066FF", light: "rgba(0, 102, 255, 0.1)" },
  },
};
const shadows = {
  card: "0 2px 8px rgba(0,0,0,0.08)", cardHover: "0 8px 24px rgba(0,0,0,0.12)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};
const borderRadius = { sm: "4px", default: "8px", md: "12px", lg: "16px", xl: "24px", full: "9999px" };


const API_BASE = "/api/v1/checker";

const checkerApi = {
  async getPendingReviews() {

    return mockInspections.filter(i => i.status === "pending_review");
  },
  async getApprovedReviews() {

    return mockInspections.filter(i => i.status === "approved");
  },
  async getRejectedReviews() {

    return mockInspections.filter(i => i.status === "rejected");
  },
  async getReviewDetail(id) {

    return mockInspections.find(i => i.id === id) || null;
  },
  async approveInspection(id, payload) {

    return { success: true, message: "Inspection approved successfully" };
  },
  async rejectInspection(id, payload) {


    return { success: true, message: "Inspection rejected and sent back to maker" };
  },
  async getDashboardStats() {

    return {
      pendingCount: 4, approvedToday: 14, rejectedWeek: 3,
      avgReviewTime: "18 min", passRate: 87.5
    };
  },
};


const mockInspections = [
  {
    id: "IRP-2026-00004",
    irNumber: "IRP-2026-00004",
    irDate: "2026-02-05",
    queueNumber: "QC-2026-00006",
    grnNumber: "GRN-2026-00004",
    grnDate: "2026-02-04",
    poNumber: "PO-2026-0201",
    vendorName: "Sri Lakshmi Electronics Pvt Ltd",
    vendorCode: "VND-001",
    supplierBillNo: "INV-SLE-2026-078",
    partCode: "BSC-TRD-001",
    partName: "B-SCAN Ultrasound Transducer 3.5MHz",
    lotNumber: "LOT-TRD-2026-05",
    lotSize: 60,
    sampleSize: 8,
    qualityPlanCode: "RD.7.3-07",
    inspectionType: "sampling",
    makerId: "USR-002",
    makerName: "Ravi Kumar",
    makerDept: "Quality Control",
    makerDate: "2026-02-05T14:30:00",
    makerRemarks: "All visual and functional checks completed. 8/8 samples passed. Lot recommended for acceptance.",
    status: "pending_review",
    priority: "high",
    overallDisposition: "accept",
    rejectionCount: 0,
    visualResult: "pass",
    functionalResult: "pass",
    stages: [
      {
        stageName: "Visual Inspection", stageType: "visual",
        sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Surface Finish", specification: "Smooth, no scratches or dents", type: "visual", results: Array(8).fill("OK") },
          { name: "Label Alignment", specification: "Labels centered, readable", type: "visual", results: Array(8).fill("OK") },
          { name: "Connector Condition", specification: "No bent pins, clean contacts", type: "visual", results: Array(8).fill("OK") },
          { name: "Cable Integrity", specification: "No kinks, cuts or fraying", type: "visual", results: Array(8).fill("OK") },
        ],
      },
      {
        stageName: "Functional Test", stageType: "functional",
        sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Output Frequency", specification: "3.5 MHz ± 0.1", type: "functional", unit: "MHz", nominal: 3.5, min: 3.4, max: 3.6, results: [3.50, 3.51, 3.49, 3.50, 3.52, 3.48, 3.50, 3.51] },
          { name: "Signal Amplitude", specification: "2.0V ± 0.2V", type: "functional", unit: "V", nominal: 2.0, min: 1.8, max: 2.2, results: [2.01, 1.98, 2.05, 2.00, 1.95, 2.02, 1.99, 2.03] },
          { name: "Beam Angle", specification: "60° ± 2°", type: "functional", unit: "°", nominal: 60, min: 58, max: 62, results: [60.1, 59.8, 60.5, 59.9, 60.2, 60.0, 59.7, 60.3] },
        ],
      },
    ],
  },
  {
    id: "IRP-2026-00005",
    irNumber: "IRP-2026-00005",
    irDate: "2026-02-05",
    queueNumber: "QC-2026-00007",
    grnNumber: "GRN-2026-00004",
    grnDate: "2026-02-04",
    poNumber: "PO-2026-0201",
    vendorName: "Sri Lakshmi Electronics Pvt Ltd",
    vendorCode: "VND-001",
    supplierBillNo: "INV-SLE-2026-078",
    partCode: "BSC-CBL-001",
    partName: "Transducer Cable Assembly 1.5m",
    lotNumber: "LOT-CBL-2026-03",
    lotSize: 80,
    sampleSize: 13,
    qualityPlanCode: "RD.7.3-07",
    inspectionType: "sampling",
    makerId: "USR-002",
    makerName: "Ravi Kumar",
    makerDept: "Quality Control",
    makerDate: "2026-02-05T16:00:00",
    makerRemarks: "Visual inspection complete. All 13 samples passed. Connectors verified.",
    status: "pending_review",
    priority: "medium",
    overallDisposition: "accept",
    rejectionCount: 0,
    visualResult: "pass",
    functionalResult: "na",
    stages: [
      {
        stageName: "Visual Inspection", stageType: "visual",
        sampleSize: 13, totalChecked: 13, totalPassed: 13, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Cable Length", specification: "1500mm ± 10mm", type: "visual", results: Array(13).fill("OK") },
          { name: "Connector Fit", specification: "Firm click, no wobble", type: "visual", results: Array(13).fill("OK") },
          { name: "Sheath Condition", specification: "No cracks, uniform color", type: "visual", results: Array(13).fill("OK") },
        ],
      },
    ],
  },
  {
    id: "IRP-2026-00006",
    irNumber: "IRP-2026-00006",
    irDate: "2026-02-04",
    queueNumber: "QC-2026-00008",
    grnNumber: "GRN-2026-00005",
    grnDate: "2026-02-03",
    poNumber: "PO-2026-0203",
    vendorName: "TechBoard Solutions",
    vendorCode: "VND-004",
    supplierBillNo: "INV-TBS-2026-034",
    partCode: "BSC-PCB-001",
    partName: "Main Control PCB Assembly",
    lotNumber: "LOT-PCB-2026-02",
    lotSize: 30,
    sampleSize: 30,
    qualityPlanCode: "A12",
    inspectionType: "100_percent",
    makerId: "USR-002",
    makerName: "Ravi Kumar",
    makerDept: "Quality Control",
    makerDate: "2026-02-04T17:00:00",
    makerRemarks: "100% inspection completed. 4 units failed electrical test — output voltage deviation. Recommend rejection of lot.",
    status: "pending_review",
    priority: "critical",
    overallDisposition: "reject",
    rejectionCount: 0,
    visualResult: "pass",
    functionalResult: "fail",
    stages: [
      {
        stageName: "Visual Inspection", stageType: "visual",
        sampleSize: 30, totalChecked: 30, totalPassed: 30, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Solder Quality", specification: "No cold joints or bridges", type: "visual", results: Array(30).fill("OK") },
          { name: "Component Placement", specification: "All ICs seated properly", type: "visual", results: Array(30).fill("OK") },
        ],
      },
      {
        stageName: "Electrical Test", stageType: "functional",
        sampleSize: 30, totalChecked: 30, totalPassed: 26, totalFailed: 4, result: "fail",
        checkpoints: [
          { name: "Output Voltage", specification: "3.3V ± 0.1V", type: "functional", unit: "V", nominal: 3.3, min: 3.2, max: 3.4,
            results: [3.30, 3.31, 3.29, 3.80, 3.30, 3.32, 3.28, 3.30, 3.31, 3.29, 3.30, 3.33, 3.31, 3.30, 3.85, 3.30, 3.29, 3.31, 3.30, 3.32, 3.30, 3.29, 3.78, 3.30, 3.31, 3.30, 3.82, 3.29, 3.30, 3.31] },
          { name: "Current Draw", specification: "≤ 250mA", type: "functional", unit: "mA", nominal: 200, min: 0, max: 250,
            results: [198, 202, 195, 310, 200, 205, 199, 201, 203, 197, 200, 208, 202, 200, 315, 199, 197, 203, 200, 205, 200, 197, 305, 201, 203, 200, 308, 197, 200, 202] },
        ],
      },
    ],
  },
  {
    id: "IRP-2026-00007",
    irNumber: "IRP-2026-00007",
    irDate: "2026-02-06",
    queueNumber: "QC-2026-00009",
    grnNumber: "GRN-2026-00006",
    grnDate: "2026-02-05",
    poNumber: "PO-2026-0204",
    vendorName: "Precision Opticals India",
    vendorCode: "VND-003",
    supplierBillNo: "INV-POI-2026-019",
    partCode: "BSC-LNS-001",
    partName: "Acoustic Lens 25mm",
    lotNumber: "LOT-LNS-2026-01",
    lotSize: 95,
    sampleSize: 13,
    qualityPlanCode: "RD.7.3-07",
    inspectionType: "sampling",
    makerId: "USR-002",
    makerName: "Ravi Kumar",
    makerDept: "Quality Control",
    makerDate: "2026-02-06T11:00:00",
    makerRemarks: "All 13 samples passed visual and dimensional checks.",
    status: "pending_review",
    priority: "normal",
    overallDisposition: "accept",
    rejectionCount: 0,
    visualResult: "pass",
    functionalResult: "pass",
    stages: [
      {
        stageName: "Visual Inspection", stageType: "visual",
        sampleSize: 13, totalChecked: 13, totalPassed: 13, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Surface Clarity", specification: "No scratches, bubbles, or inclusions", type: "visual", results: Array(13).fill("OK") },
          { name: "Edge Finish", specification: "Smooth edges, no chips", type: "visual", results: Array(13).fill("OK") },
        ],
      },
      {
        stageName: "Dimensional Check", stageType: "functional",
        sampleSize: 13, totalChecked: 13, totalPassed: 13, totalFailed: 0, result: "pass",
        checkpoints: [
          { name: "Diameter", specification: "25.0mm ± 0.05mm", type: "functional", unit: "mm", nominal: 25.0, min: 24.95, max: 25.05,
            results: [25.01, 24.99, 25.02, 25.00, 24.98, 25.01, 25.00, 24.99, 25.02, 25.01, 25.00, 24.99, 25.01] },
          { name: "Thickness", specification: "4.0mm ± 0.1mm", type: "functional", unit: "mm", nominal: 4.0, min: 3.9, max: 4.1,
            results: [4.01, 3.99, 4.02, 4.00, 3.98, 4.01, 4.00, 3.99, 4.02, 4.01, 4.00, 3.99, 4.01] },
        ],
      },
    ],
  },

  {
    id: "IRP-2026-00001",
    irNumber: "IRP-2026-00001", irDate: "2026-01-16", queueNumber: "QC-2026-00001",
    grnNumber: "GRN-2026-00001", grnDate: "2026-01-15", poNumber: "PO-2026-0101",
    vendorName: "Sri Lakshmi Electronics Pvt Ltd", vendorCode: "VND-001",
    supplierBillNo: "INV-SLE-2026-045",
    partCode: "BSC-TRD-001", partName: "B-SCAN Ultrasound Transducer 3.5MHz",
    lotNumber: "LOT-TRD-2026-01", lotSize: 50, sampleSize: 8,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-002", makerName: "Ravi Kumar", makerDept: "Quality Control",
    makerDate: "2026-01-16T15:00:00",
    makerRemarks: "Inspection complete — all passed.",
    status: "approved", priority: "high",
    overallDisposition: "accept", rejectionCount: 0,
    visualResult: "pass", functionalResult: "pass",
    checkerRemarks: "Verified all results. Approved for store transfer.",
    checkerDate: "2026-01-16T16:00:00",
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [{ name: "Surface Finish", specification: "Smooth", type: "visual", results: Array(8).fill("OK") }] },
      { stageName: "Functional Test", stageType: "functional", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [{ name: "Output Frequency", specification: "3.5 MHz ± 0.1", type: "functional", unit: "MHz", nominal: 3.5, min: 3.4, max: 3.6, results: [3.50,3.51,3.49,3.50,3.52,3.48,3.50,3.51] }] },
    ],
  },
  {
    id: "IRP-2026-00002",
    irNumber: "IRP-2026-00002", irDate: "2026-01-16", queueNumber: "QC-2026-00002",
    grnNumber: "GRN-2026-00001", grnDate: "2026-01-15", poNumber: "PO-2026-0101",
    vendorName: "Sri Lakshmi Electronics Pvt Ltd", vendorCode: "VND-001",
    supplierBillNo: "INV-SLE-2026-045",
    partCode: "BSC-CBL-001", partName: "Transducer Cable Assembly 1.5m",
    lotNumber: "LOT-CBL-2026-01", lotSize: 50, sampleSize: 8,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-003", makerName: "Anand Krishnan", makerDept: "Quality Control",
    makerDate: "2026-01-16T14:00:00",
    makerRemarks: "All checkpoints passed.",
    status: "approved", priority: "medium",
    overallDisposition: "accept", rejectionCount: 0,
    visualResult: "pass", functionalResult: "pass",
    checkerRemarks: "Verified. Good quality lot.",
    checkerDate: "2026-01-16T15:30:00",
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [{ name: "Cable Condition", specification: "No damage", type: "visual", results: Array(8).fill("OK") }] },
    ],
  },


  {
    id: "IRP-2026-00006",
    irNumber: "IRP-2026-00006", irDate: "2026-01-25", queueNumber: "QC-2026-00004",
    grnNumber: "GRN-2026-00003", grnDate: "2026-01-24", poNumber: "PO-2026-0103",
    vendorName: "Precision Moulders India", vendorCode: "VND-003",
    supplierBillNo: "INV-PMI-2026-088",
    partCode: "BSC-HSG-001", partName: "Scanner Housing Assembly",
    lotNumber: "LOT-HSG-2026-01", lotSize: 95, sampleSize: 13,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-003", makerName: "Anand Krishnan", makerDept: "Quality Control",
    makerDate: "2026-01-25T14:30:00",
    makerRemarks: "All samples passed visual & dimensional checks. Good batch quality.",
    status: "approved", priority: "high",
    overallDisposition: "accept", rejectionCount: 0,
    visualResult: "pass", functionalResult: "pass",
    checkerRemarks: "Dimensional results verified. All within tolerance. Batch approved for store.",
    checkerDate: "2026-01-25T16:00:00",
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 13, totalChecked: 13, totalPassed: 13, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Surface Finish", specification: "Smooth, no burrs", type: "visual", results: Array(13).fill("OK") },
        { name: "Color Consistency", specification: "Pantone Cool Gray 3C", type: "visual", results: Array(13).fill("OK") },
        { name: "Logo Embossing", specification: "Clear & centered", type: "visual", results: Array(13).fill("OK") },
      ]},
      { stageName: "Dimensional Test", stageType: "functional", sampleSize: 13, totalChecked: 13, totalPassed: 13, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Overall Length", specification: "220mm ± 1.0", type: "functional", unit: "mm", nominal: 220, min: 219, max: 221, results: [220.1,219.8,220.3,220.0,219.9,220.2,220.1,219.7,220.0,220.4,219.8,220.1,220.0] },
        { name: "Wall Thickness", specification: "2.5mm ± 0.2", type: "functional", unit: "mm", nominal: 2.5, min: 2.3, max: 2.7, results: [2.48,2.52,2.50,2.49,2.53,2.47,2.51,2.50,2.48,2.52,2.49,2.50,2.51] },
      ]},
    ],
  },

  {
    id: "IRP-2026-00007",
    irNumber: "IRP-2026-00007", irDate: "2026-01-27", queueNumber: "QC-2026-00006",
    grnNumber: "GRN-2026-00004", grnDate: "2026-01-26", poNumber: "PO-2026-0104",
    vendorName: "PowerTech Components", vendorCode: "VND-006",
    supplierBillNo: "INV-PTC-2026-034",
    partCode: "BSC-PSU-001", partName: "Medical Grade Power Supply 12V",
    lotNumber: "LOT-PSU-2026-01", lotSize: 30, sampleSize: 8,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-002", makerName: "Ravi Kumar", makerDept: "Quality Control",
    makerDate: "2026-01-27T11:30:00",
    makerRemarks: "All electrical safety and functional tests passed. CE marking verified.",
    status: "approved", priority: "medium",
    overallDisposition: "accept", rejectionCount: 0,
    visualResult: "pass", functionalResult: "pass",
    checkerRemarks: "Safety certifications validated. Output regulation within spec. Approved.",
    checkerDate: "2026-01-27T14:00:00",
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Label & Markings", specification: "CE/UL marks present", type: "visual", results: Array(8).fill("OK") },
        { name: "Connector Condition", specification: "No bent pins", type: "visual", results: Array(8).fill("OK") },
      ]},
      { stageName: "Electrical Test", stageType: "functional", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Output Voltage", specification: "12V ± 0.5V", type: "functional", unit: "V", nominal: 12.0, min: 11.5, max: 12.5, results: [12.02,11.98,12.05,11.97,12.01,12.03,11.99,12.00] },
        { name: "Ripple Voltage", specification: "< 50mV", type: "functional", unit: "mV", nominal: 0, min: 0, max: 50, results: [22,18,25,20,19,23,21,24] },
        { name: "Leakage Current", specification: "< 100µA", type: "functional", unit: "µA", nominal: 0, min: 0, max: 100, results: [42,38,45,40,36,41,39,43] },
      ]},
    ],
  },

  {
    id: "IRP-2026-00008",
    irNumber: "IRP-2026-00008", irDate: "2026-02-01", queueNumber: "QC-2026-00007",
    grnNumber: "GRN-2026-00005", grnDate: "2026-01-30", poNumber: "PO-2026-0105",
    vendorName: "OmniDisplay Technologies", vendorCode: "VND-007",
    supplierBillNo: "INV-ODT-2026-019",
    partCode: "BSC-DIS-001", partName: "5.7\" TFT LCD Display Module",
    lotNumber: "LOT-DIS-2026-01", lotSize: 40, sampleSize: 8,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-003", makerName: "Anand Krishnan", makerDept: "Quality Control",
    makerDate: "2026-02-01T15:00:00",
    makerRemarks: "Re-inspection complete after vendor replaced 3 defective units. All 8 samples now within spec.",
    status: "approved", priority: "high",
    overallDisposition: "accept", rejectionCount: 1,
    visualResult: "pass", functionalResult: "pass",
    checkerRemarks: "Re-inspection verified. Replacement units conform to spec. Batch approved after vendor correction.",
    checkerDate: "2026-02-01T16:30:00",
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Screen Clarity", specification: "No dead pixels", type: "visual", results: Array(8).fill("OK") },
        { name: "Bezel Alignment", specification: "Flush ± 0.3mm", type: "visual", results: Array(8).fill("OK") },
      ]},
      { stageName: "Functional Test", stageType: "functional", sampleSize: 8, totalChecked: 8, totalPassed: 8, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Brightness", specification: "350 cd/m² ± 30", type: "functional", unit: "cd/m²", nominal: 350, min: 320, max: 380, results: [348,355,342,360,345,351,349,353] },
        { name: "Response Time", specification: "< 25ms", type: "functional", unit: "ms", nominal: 0, min: 0, max: 25, results: [18,16,20,17,19,15,18,16] },
      ]},
    ],
  },


  {
    id: "IRP-2026-00003",
    irNumber: "IRP-2026-00003", irDate: "2026-01-21", queueNumber: "QC-2026-00003",
    grnNumber: "GRN-2026-00002", grnDate: "2026-01-20", poNumber: "PO-2026-0102",
    vendorName: "TechBoard Solutions", vendorCode: "VND-004",
    supplierBillNo: "INV-TBS-2026-012",
    partCode: "BSC-PCB-001", partName: "Main Control PCB Assembly",
    lotNumber: "LOT-PCB-2026-01", lotSize: 25, sampleSize: 25,
    qualityPlanCode: "A12", inspectionType: "100_percent",
    makerId: "USR-002", makerName: "Ravi Kumar", makerDept: "Quality Control",
    makerDate: "2026-01-21T16:00:00",
    makerRemarks: "10 out of 25 failed electrical test. Recommend rejection.",
    status: "rejected", priority: "critical",
    overallDisposition: "reject", rejectionCount: 1,
    visualResult: "pass", functionalResult: "fail",
    rejectionCategory: "functional_failure",
    rejectionReason: "Output voltage outside tolerance on 40% of units",
    checkerRemarks: "Confirmed 40% failure rate. Batch rejected. Initiate vendor return.",
    checkerDate: "2026-01-21T17:30:00",
    reInspectionStatus: "vendor_return_initiated",
    returnedToMaker: true,
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 25, totalChecked: 25, totalPassed: 25, totalFailed: 0, result: "pass", checkpoints: [{ name: "Solder Quality", specification: "No cold joints", type: "visual", results: Array(25).fill("OK") }] },
      { stageName: "Electrical Test", stageType: "functional", sampleSize: 25, totalChecked: 25, totalPassed: 15, totalFailed: 10, result: "fail", checkpoints: [{ name: "Output Voltage", specification: "3.3V ± 0.1V", type: "functional", unit: "V", nominal: 3.3, min: 3.2, max: 3.4, results: [3.30,3.31,3.29,3.80,3.30,3.32,3.28,3.30,3.31,3.29,3.30,3.33,3.31,3.30,3.85,3.30,3.29,3.31,3.30,3.32,3.30,3.29,3.78,3.30,3.31] }] },
    ],
  },

  {
    id: "IRP-2026-00009",
    irNumber: "IRP-2026-00009", irDate: "2026-02-03", queueNumber: "QC-2026-00005",
    grnNumber: "GRN-2026-00004", grnDate: "2026-02-02", poNumber: "PO-2026-0106",
    vendorName: "OptoClear Materials", vendorCode: "VND-008",
    supplierBillNo: "INV-OCM-2026-041",
    partCode: "BSC-ALN-001", partName: "Acoustic Lens 25mm",
    lotNumber: "LOT-ALN-2026-01", lotSize: 200, sampleSize: 20,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-002", makerName: "Ravi Kumar", makerDept: "Quality Control",
    makerDate: "2026-02-03T12:00:00",
    makerRemarks: "5 out of 20 samples have visible micro-scratches on lens surface. 3 have air bubbles in epoxy layer. Reject recommended.",
    status: "rejected", priority: "high",
    overallDisposition: "reject", rejectionCount: 1,
    visualResult: "fail", functionalResult: "pass",
    rejectionCategory: "cosmetic_defect",
    rejectionReason: "Surface scratches and air bubbles on 8 out of 20 samples",
    checkerRemarks: "Verified under 10x magnification. Micro-scratches confirmed on samples #3,7,9,12,18. Air bubbles found in #4,11,16. 40% defect rate exceeds AQL. Batch rejected — vendor to replace.",
    checkerDate: "2026-02-03T14:30:00",
    reInspectionStatus: "pending_vendor_response",
    returnedToMaker: true,
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 20, totalChecked: 20, totalPassed: 12, totalFailed: 8, result: "fail", checkpoints: [
        { name: "Lens Surface Clarity", specification: "No scratches/inclusions", type: "visual", results: ["OK","OK","NG","OK","OK","OK","NG","OK","NG","OK","OK","NG","OK","OK","OK","OK","NG","NG","OK","OK"] },
        { name: "Epoxy Layer Integrity", specification: "No air bubbles", type: "visual", results: ["OK","OK","OK","NG","OK","OK","OK","OK","OK","OK","NG","OK","OK","OK","OK","NG","OK","OK","OK","OK"] },
        { name: "Edge Finish", specification: "Smooth, no chips", type: "visual", results: Array(20).fill("OK") },
      ]},
      { stageName: "Functional Test", stageType: "functional", sampleSize: 20, totalChecked: 20, totalPassed: 20, totalFailed: 0, result: "pass", checkpoints: [
        { name: "Acoustic Impedance", specification: "1.5 MRayl ± 0.1", type: "functional", unit: "MRayl", nominal: 1.5, min: 1.4, max: 1.6, results: [1.50,1.48,1.52,1.49,1.51,1.50,1.48,1.53,1.50,1.49,1.51,1.50,1.48,1.52,1.50,1.49,1.51,1.50,1.48,1.52] },
        { name: "Focal Length", specification: "60mm ± 2.0", type: "functional", unit: "mm", nominal: 60, min: 58, max: 62, results: [60.1,59.8,60.3,60.0,59.9,60.2,60.1,59.7,60.0,60.4,59.8,60.1,60.0,59.9,60.2,60.3,59.8,60.1,60.0,59.9] },
      ]},
    ],
  },

  {
    id: "IRP-2026-00010",
    irNumber: "IRP-2026-00010", irDate: "2026-02-05", queueNumber: "QC-2026-00008",
    grnNumber: "GRN-2026-00006", grnDate: "2026-02-04", poNumber: "PO-2026-0107",
    vendorName: "FlexiSwitch Industries", vendorCode: "VND-009",
    supplierBillNo: "INV-FSI-2026-022",
    partCode: "BSC-KEY-001", partName: "B-SCAN Membrane Keypad Assembly",
    lotNumber: "LOT-KEY-2026-01", lotSize: 120, sampleSize: 13,
    qualityPlanCode: "RD.7.3-07", inspectionType: "sampling",
    makerId: "USR-003", makerName: "Anand Krishnan", makerDept: "Quality Control",
    makerDate: "2026-02-05T10:30:00",
    makerRemarks: "4 out of 13 keypads have button registration misalignment >0.5mm. 2 buttons non-responsive on sample #6. Tactile feedback inconsistent across batch.",
    status: "rejected", priority: "medium",
    overallDisposition: "reject", rejectionCount: 1,
    visualResult: "fail", functionalResult: "fail",
    rejectionCategory: "dimensional_deviation",
    rejectionReason: "Button alignment out of tolerance; tactile response failure on 2 samples",
    checkerRemarks: "Dimensional check confirms misalignment on 4 samples exceeds ±0.3mm spec. Button #5 and #8 unresponsive on sample 6. Tactile force varies 80–180gf vs spec 120gf ±20. Vendor to investigate die alignment and dome quality.",
    checkerDate: "2026-02-05T13:00:00",
    reInspectionStatus: "re_inspection_pending",
    returnedToMaker: true,
    stages: [
      { stageName: "Visual Inspection", stageType: "visual", sampleSize: 13, totalChecked: 13, totalPassed: 9, totalFailed: 4, result: "fail", checkpoints: [
        { name: "Button Alignment", specification: "Centered ± 0.3mm", type: "visual", results: ["OK","OK","NG","OK","OK","NG","OK","NG","OK","OK","OK","NG","OK"] },
        { name: "Print Quality", specification: "Sharp, no smudging", type: "visual", results: Array(13).fill("OK") },
        { name: "Adhesive Coverage", specification: "Full coverage, no gaps", type: "visual", results: Array(13).fill("OK") },
      ]},
      { stageName: "Functional Test", stageType: "functional", sampleSize: 13, totalChecked: 13, totalPassed: 11, totalFailed: 2, result: "fail", checkpoints: [
        { name: "Button Tactile Force", specification: "120gf ± 20", type: "functional", unit: "gf", nominal: 120, min: 100, max: 140, results: [118,122,115,125,120,82,119,123,180,117,121,116,120] },
        { name: "Contact Resistance", specification: "< 100Ω", type: "functional", unit: "Ω", nominal: 0, min: 0, max: 100, results: [45,52,48,55,50,350,47,53,62,49,51,46,50] },
      ]},
    ],
  },
];


const formatDate = (d) => { if (!d) return "—"; const dt = new Date(d); return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };
const formatDateTime = (d) => { if (!d) return "—"; const dt = new Date(d); return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };
const formatTimeAgo = (d) => {
  const now = new Date(); const past = new Date(d); const diff = Math.floor((now - past) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
const getPriorityStyle = (p) => {
  if (p === "critical") return { bg: colors.dangerBg, color: colors.danger, label: "CRITICAL" };
  if (p === "high") return { bg: colors.warningBg, color: colors.warning, label: "HIGH" };
  if (p === "medium") return { bg: colors.infoBg, color: colors.info, label: "MEDIUM" };
  return { bg: colors.neutral[100], color: colors.neutral[600], label: "NORMAL" };
};
const getStatusStyle = (s) => {
  if (s === "approved") return { bg: colors.successBg, color: colors.success, label: "Approved", icon: CheckCircle2 };
  if (s === "rejected") return { bg: colors.dangerBg, color: colors.danger, label: "Rejected", icon: XCircle };
  if (s === "pending_review") return { bg: colors.warningBg, color: colors.warning, label: "Pending Review", icon: Clock };
  return { bg: colors.neutral[100], color: colors.neutral[600], label: s, icon: Info };
};
const getResultStyle = (r) => {
  if (r === "pass") return { bg: colors.successBg, color: colors.success };
  if (r === "fail") return { bg: colors.dangerBg, color: colors.danger };
  return { bg: colors.neutral[100], color: colors.neutral[500] };
};


const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes ckFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ckSlideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ckPulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }
  @keyframes ckShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes ckScaleIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
  @keyframes ckSpin { to { transform: rotate(360deg); } }
  .ck-fade-in { animation: ckFadeIn .4s ease both; }
  .ck-slide-up { animation: ckSlideUp .5s ease both; }
  .ck-scale-in { animation: ckScaleIn .3s ease both; }
  .ck-spin { animation: ckSpin .8s linear infinite; }
`;
if (typeof document !== 'undefined' && !document.getElementById("ck-styles")) {
  styleTag.id = "ck-styles";
  document.head.appendChild(styleTag);
}


export default function CheckerValidationCenter() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspections, setInspections] = useState(mockInspections);
  const [activeTab, setActiveTab] = useState("pending");
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionRemarks, setActionRemarks] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const user = { name: "Priya Sharma", role: "checker", department: "Quality Assurance", employeeId: "EMP023" };


  const filteredInspections = inspections.filter(i => {
    const matchesTab = activeTab === "pending" ? i.status === "pending_review" :
                       activeTab === "approved" ? i.status === "approved" :
                       activeTab === "rejected" ? i.status === "rejected" : true;
    const matchesSearch = searchQuery === "" ||
      i.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.irNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.makerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: inspections.filter(i => i.status === "pending_review").length,
    approved: inspections.filter(i => i.status === "approved").length,
    rejected: inspections.filter(i => i.status === "rejected").length,
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openReview = (inspection) => {
    setSelectedInspection(inspection);
    setCurrentView("review");
  };

  const backToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedInspection(null);
    setShowActionModal(null);
    setActionRemarks("");
  };

  const handleApprove = async () => {
    if (!actionRemarks.trim()) return;
    setProcessing(true);
    try {
      await checkerApi.approveInspection(selectedInspection.id, {
        checkerRemarks: actionRemarks,
        checkerDate: new Date().toISOString(),
        checkerId: "USR-CHECKER-001",
        checkerName: user.name,
      });
      setInspections(prev => prev.map(i =>
        i.id === selectedInspection.id ? { ...i, status: "approved", checkerRemarks: actionRemarks, checkerDate: new Date().toISOString() } : i
      ));
      setSelectedInspection(prev => ({ ...prev, status: "approved", checkerRemarks: actionRemarks, checkerDate: new Date().toISOString() }));
      setShowActionModal(null);
      setActionRemarks("");
      showToast("Inspection approved successfully! Store transfer can now proceed.", "success");
    } catch (e) {
      showToast("Failed to approve. Please try again.", "error");
    } finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!actionRemarks.trim() || !rejectionCategory) return;
    setProcessing(true);
    try {
      await checkerApi.rejectInspection(selectedInspection.id, {
        checkerRemarks: actionRemarks,
        rejectionCategory: rejectionCategory,
        rejectionReason: rejectionReason,
        checkerDate: new Date().toISOString(),
        checkerId: "USR-CHECKER-001",
        checkerName: user.name,
        returnToMaker: true,
      });
      setInspections(prev => prev.map(i =>
        i.id === selectedInspection.id ? { ...i, status: "rejected", checkerRemarks: actionRemarks, rejectionCategory, rejectionReason, checkerDate: new Date().toISOString(), rejectionCount: (i.rejectionCount || 0) + 1, returnedToMaker: true } : i
      ));
      setSelectedInspection(prev => ({ ...prev, status: "rejected", checkerRemarks: actionRemarks, rejectionCategory, rejectionReason, checkerDate: new Date().toISOString(), returnedToMaker: true }));
      setShowActionModal(null);
      setActionRemarks("");
      setRejectionCategory("");
      setRejectionReason("");
      showToast(`Inspection rejected. ${selectedInspection.irNumber} has been returned to ${selectedInspection.makerName}'s queue for re-inspection.`, "warning");
    } catch (e) {
      showToast("Failed to reject. Please try again.", "error");
    } finally { setProcessing(false); }
  };


  return (
    <div style={{ minHeight: "100vh", background: colors.background.secondary, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {currentView === "dashboard" ? (
        <DashboardView
          user={user}
          inspections={filteredInspections}
          counts={counts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenReview={openReview}
        />
      ) : (
        <ReviewDetailView
          inspection={selectedInspection}
          user={user}
          onBack={backToDashboard}
          onApprove={() => setShowActionModal("approve")}
          onReject={() => setShowActionModal("reject")}
        />
      )}

      {/* Action Modal */}
      {showActionModal && (
        <ActionModal
          type={showActionModal}
          inspection={selectedInspection}
          remarks={actionRemarks}
          setRemarks={setActionRemarks}
          rejectionCategory={rejectionCategory}
          setRejectionCategory={setRejectionCategory}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          processing={processing}
          onConfirm={showActionModal === "approve" ? handleApprove : handleReject}
          onCancel={() => { setShowActionModal(null); setActionRemarks(""); setRejectionCategory(""); setRejectionReason(""); }}
        />
      )}
    </div>
  );
}


const Toast = ({ message, type, onClose }) => {
  const bg = type === "success" ? colors.success : type === "error" ? colors.danger : type === "warning" ? colors.warning : colors.info;
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? XCircle : type === "warning" ? AlertTriangle : Info;
  return (
    <div className="ck-slide-up" style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      padding: "16px 24px", borderRadius: borderRadius.md,
      background: "white", border: `1px solid ${bg}20`, boxShadow: shadows.xl,
      maxWidth: 420, minWidth: 320
    }}>
      <div style={{ width: 36, height: 36, borderRadius: borderRadius.default, background: `${bg}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={bg} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 500, color: colors.text.primary, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: colors.neutral[400] }}><X size={16} /></button>
    </div>
  );
};


const DashboardView = ({ user, inspections, counts, activeTab, setActiveTab, searchQuery, setSearchQuery, onOpenReview }) => {
  const stats = [
    { label: "Pending Review", value: counts.pending, icon: ListChecks, color: colors.warning, change: `${counts.pending} awaiting` },
    { label: "Approved Today", value: counts.approved, icon: CheckCircle2, color: colors.success, change: "This period" },
    { label: "Rejected", value: counts.rejected, icon: XCircle, color: colors.danger, change: "Needs action" },
    { label: "Avg. Review Time", value: "18m", icon: Clock, color: colors.primary, change: "-5 min vs avg" },
  ];

  const tabs = [
    { id: "pending", label: "Pending Review", count: counts.pending, icon: Clock },
    { id: "approved", label: "Approved", count: counts.approved, icon: CheckCircle2 },
    { id: "rejected", label: "Rejected", count: counts.rejected, icon: XCircle },
  ];

  return (
    <div style={{ padding: "0 0 40px" }}>
      {}
      <div style={{
        background: "white", borderBottom: `1px solid ${colors.border.light}`,
        padding: "28px 32px 24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, margin: 0 }}>
              QC Validation Center
            </h1>
            <p style={{ fontSize: 16, color: colors.text.tertiary, margin: "6px 0 0" }}>
              Welcome, <strong style={{ color: colors.roles.checker.primary }}>{user.name}</strong> — Review and validate QC inspections
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: borderRadius.full,
              background: colors.roles.checker.light, border: `1px solid ${colors.roles.checker.primary}30`,
            }}>
              <Shield size={16} color={colors.roles.checker.primary} />
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.roles.checker.primary }}>Checker</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {}
        <div className="ck-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: "white", borderRadius: borderRadius.xl, padding: "22px 24px",
                boxShadow: shadows.card, border: `1px solid ${colors.neutral[100]}`,
                animationDelay: `${i * 80}ms`,
              }} className="ck-fade-in">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: borderRadius.lg,
                    background: `${s.color}10`, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Icon size={24} color={s.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: colors.text.tertiary, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: colors.neutral[500], marginTop: 4 }}>{s.change}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className="ck-fade-in" style={{
          background: "white", borderRadius: borderRadius.xl, boxShadow: shadows.card,
          border: `1px solid ${colors.neutral[100]}`, overflow: "hidden",
          animationDelay: "300ms"
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: `1px solid ${colors.border.light}`, padding: "0 24px",
          }}>
            <div style={{ display: "flex", gap: 0 }}>
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    padding: "16px 24px", background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    borderBottom: `3px solid ${isActive ? colors.roles.checker.primary : "transparent"}`,
                    color: isActive ? colors.roles.checker.primary : colors.neutral[500],
                    fontWeight: isActive ? 600 : 500, fontSize: 15, transition: "all .2s",
                  }}>
                    <TabIcon size={17} />
                    {tab.label}
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: borderRadius.full,
                      background: isActive ? colors.roles.checker.light : colors.neutral[100],
                      color: isActive ? colors.roles.checker.primary : colors.neutral[600],
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: borderRadius.default,
              border: `1px solid ${colors.border.light}`, background: colors.neutral[50],
            }}>
              <Search size={16} color={colors.neutral[400]} />
              <input
                placeholder="Search by part, IR number, maker..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: "none", background: "none", outline: "none",
                  fontSize: 14, color: colors.text.primary, width: 260,
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <X size={14} color={colors.neutral[400]} />
                </button>
              )}
            </div>
          </div>

          {}
          <div style={{ padding: 24 }}>
            {inspections.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: colors.neutral[400] }}>
                <ListChecks size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontSize: 17, fontWeight: 600 }}>No inspections found</p>
                <p style={{ fontSize: 14 }}>
                  {searchQuery ? "Try adjusting your search" : `No ${activeTab} items at this time`}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {inspections.map((ins, idx) => (
                  <InspectionCard
                    key={ins.id}
                    inspection={ins}
                    index={idx}
                    onView={() => onOpenReview(ins)}
                    showActions={activeTab === "pending"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const InspectionCard = ({ inspection, index, onView, showActions }) => {
  const [hovered, setHovered] = useState(false);
  const ins = inspection;
  const priority = getPriorityStyle(ins.priority);
  const status = getStatusStyle(ins.status);
  const StatusIcon = status.icon;
  const totalPassed = ins.stages?.reduce((s, st) => s + st.totalPassed, 0) || 0;
  const totalChecked = ins.stages?.reduce((s, st) => s + st.totalChecked, 0) || 0;
  const passRate = totalChecked > 0 ? Math.round((totalPassed / totalChecked) * 100) : 0;
  const hasFailures = ins.stages?.some(s => s.totalFailed > 0);

  return (
    <div
      className="ck-fade-in"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: borderRadius.lg,
        border: `1px solid ${hovered ? colors.roles.checker.primary + "40" : colors.border.light}`,
        boxShadow: hovered ? shadows.cardHover : shadows.card,
        transition: "all .25s ease", cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        animationDelay: `${index * 60}ms`,
        borderLeft: `4px solid ${hasFailures ? colors.danger : ins.status === "approved" ? colors.success : ins.status === "rejected" ? colors.danger : colors.warning}`,
      }}
      onClick={onView}
    >
      <div style={{ padding: "20px 24px" }}>
        {}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: borderRadius.full,
              background: priority.bg, color: priority.color, textTransform: "uppercase", letterSpacing: 0.5,
            }}>{priority.label}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: borderRadius.full,
              background: status.bg, color: status.color,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <StatusIcon size={12} /> {status.label}
            </span>
            {ins.rejectionCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: borderRadius.full,
                background: colors.dangerBg, color: colors.danger,
              }}>
                <RotateCcw size={11} style={{ marginRight: 3, verticalAlign: "middle" }} />
                Re-inspection #{ins.rejectionCount}
              </span>
            )}
            {ins.status === "rejected" && ins.rejectionCategory && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: borderRadius.full,
                background: colors.neutral[100], color: colors.neutral[700],
              }}>
                {REJECTION_CATEGORIES.find(c => c.id === ins.rejectionCategory)?.label || ins.rejectionCategory}
              </span>
            )}
          </div>
          <span style={{ fontSize: 13, color: colors.neutral[500] }}>
            Submitted {formatTimeAgo(ins.makerDate)}
          </span>
        </div>

        {}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary, margin: "0 0 6px" }}>
              {ins.partName}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 14, color: colors.text.secondary }}>
              <span><strong style={{ color: colors.neutral[500], fontWeight: 500 }}>IR:</strong> {ins.irNumber}</span>
              <span><strong style={{ color: colors.neutral[500], fontWeight: 500 }}>Part:</strong> {ins.partCode}</span>
              <span><strong style={{ color: colors.neutral[500], fontWeight: 500 }}>GRN:</strong> {ins.grnNumber}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <User size={13} /> {ins.makerName}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 14, color: colors.text.tertiary }}>
              <span>Lot: <strong style={{ color: colors.text.primary }}>{ins.lotSize}</strong></span>
              <span>Sample: <strong style={{ color: colors.text.primary }}>{ins.sampleSize}</strong></span>
              <span>Plan: <strong style={{ color: colors.text.primary }}>{ins.qualityPlanCode}</strong></span>
              <span>Type: <strong style={{ color: colors.text.primary, textTransform: "capitalize" }}>{ins.inspectionType.replace("_", " ")}</strong></span>
            </div>
          </div>

          {}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginLeft: 24 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke={colors.neutral[100]} strokeWidth="5" />
                <circle cx="36" cy="36" r="30" fill="none"
                  stroke={passRate >= 90 ? colors.success : passRate >= 70 ? colors.warning : colors.danger}
                  strokeWidth="5" strokeDasharray={`${passRate * 1.885} ${188.5 - passRate * 1.885}`}
                  strokeDashoffset="47.1" strokeLinecap="round" style={{ transition: "stroke-dasharray .8s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: colors.text.primary, lineHeight: 1 }}>{passRate}%</span>
                <span style={{ fontSize: 10, color: colors.neutral[500] }}>Pass</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: colors.success }}>
                <CheckCircle2 size={13} /> {totalPassed}
              </span>
              {totalChecked - totalPassed > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: colors.danger }}>
                  <XCircle size={13} /> {totalChecked - totalPassed}
                </span>
              )}
            </div>
          </div>
        </div>

        {}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.neutral[100]}`,
          gap: 16,
        }}>
          <div style={{ fontSize: 14, color: colors.neutral[500], flex: 1, minWidth: 0 }}>
            {}
            {ins.status === "rejected" && ins.checkerRemarks ? (
              <div>
                <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <ShieldCheck size={14} color={colors.danger} />
                  <strong style={{ color: colors.danger, fontWeight: 600, fontSize: 13 }}>Rejection Remarks:</strong>
                </span>
                <em style={{ color: colors.text.secondary, lineHeight: 1.5 }}>
                  "{ins.checkerRemarks.substring(0, 120)}{ins.checkerRemarks.length > 120 ? "..." : ""}"
                </em>
              </div>
            ) : ins.makerRemarks ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquare size={14} />
                <em>"{ins.makerRemarks.substring(0, 80)}{ins.makerRemarks.length > 80 ? "..." : ""}"</em>
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {ins.status === "rejected" && (
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: borderRadius.default,
                background: colors.warningBg, border: `1px solid ${colors.warning}30`,
                color: colors.warningDark, fontSize: 13, fontWeight: 600,
              }}>
                <RotateCcw size={14} /> Sent back to Maker
              </span>
            )}
            <button onClick={(e) => { e.stopPropagation(); onView(); }} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 20px", borderRadius: borderRadius.default,
              border: `1px solid ${colors.roles.checker.primary}40`,
              background: colors.roles.checker.light, color: colors.roles.checker.primary,
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s",
            }}>
              <Eye size={14} /> Review Details
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ReviewDetailView = ({ inspection, user, onBack, onApprove, onReject }) => {
  const [expandedStages, setExpandedStages] = useState({});
  const ins = inspection;
  if (!ins) return null;

  const status = getStatusStyle(ins.status);
  const priority = getPriorityStyle(ins.priority);
  const StatusIcon = status.icon;
  const isPending = ins.status === "pending_review";
  const totalPassed = ins.stages?.reduce((s, st) => s + st.totalPassed, 0) || 0;
  const totalChecked = ins.stages?.reduce((s, st) => s + st.totalChecked, 0) || 0;
  const totalFailed = totalChecked - totalPassed;
  const passRate = totalChecked > 0 ? Math.round((totalPassed / totalChecked) * 100) : 0;

  const toggleStage = (idx) => setExpandedStages(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="ck-fade-in" style={{ padding: "0 0 60px" }}>
      {}
      <div style={{
        background: "white", borderBottom: `1px solid ${colors.border.light}`,
        padding: "20px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onBack} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: borderRadius.default, border: `1px solid ${colors.border.light}`,
              background: "white", color: colors.text.secondary, fontSize: 14, fontWeight: 500,
              cursor: "pointer", transition: "all .2s",
            }}>
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text.primary, margin: 0 }}>
                  Inspection Review
                </h1>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: borderRadius.full,
                  background: status.bg, color: status.color, display: "flex", alignItems: "center", gap: 4,
                }}>
                  <StatusIcon size={13} /> {status.label}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: borderRadius.full,
                  background: priority.bg, color: priority.color, textTransform: "uppercase",
                }}>{priority.label}</span>
              </div>
              <p style={{ fontSize: 15, color: colors.text.tertiary, margin: "4px 0 0" }}>
                {ins.irNumber} — {ins.partName}
              </p>
            </div>
          </div>
          {isPending && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onReject} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 24px", borderRadius: borderRadius.default,
                border: `2px solid ${colors.danger}`, background: "white",
                color: colors.danger, fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "all .2s",
              }}>
                <ThumbsDown size={18} /> Reject
              </button>
              <button onClick={onApprove} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 28px", borderRadius: borderRadius.default,
                border: "none", background: colors.success,
                color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "all .2s", boxShadow: `0 4px 14px ${colors.success}40`,
              }}>
                <ThumbsUp size={18} /> Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {}
      <div style={{ padding: "24px 32px", maxWidth: 1280, margin: "0 auto" }}>
        {}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
          {}
          <div className="ck-fade-in" style={{ background: "white", borderRadius: borderRadius.xl, padding: 24, boxShadow: shadows.card, border: `1px solid ${colors.neutral[100]}`, animationDelay: "100ms" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} color={colors.primary} /> Inspection Details
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label="IR Number" value={ins.irNumber} />
              <InfoRow label="IR Date" value={formatDate(ins.irDate)} />
              <InfoRow label="Queue No." value={ins.queueNumber} />
              <InfoRow label="Quality Plan" value={ins.qualityPlanCode} />
              <InfoRow label="Inspection Type" value={ins.inspectionType?.replace("_", " ")} capitalize />
              <InfoRow label="Disposition" value={ins.overallDisposition?.toUpperCase()} highlight={ins.overallDisposition === "reject" ? "danger" : "success"} />
            </div>
          </div>

          {}
          <div className="ck-fade-in" style={{ background: "white", borderRadius: borderRadius.xl, padding: 24, boxShadow: shadows.card, border: `1px solid ${colors.neutral[100]}`, animationDelay: "200ms" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={18} color={colors.info} /> GRN & Vendor
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label="GRN Number" value={ins.grnNumber} />
              <InfoRow label="GRN Date" value={formatDate(ins.grnDate)} />
              <InfoRow label="PO Number" value={ins.poNumber} />
              <InfoRow label="Vendor" value={ins.vendorName} />
              <InfoRow label="Bill No." value={ins.supplierBillNo} />
              <InfoRow label="Lot No." value={ins.lotNumber} />
            </div>
          </div>

          {}
          <div className="ck-fade-in" style={{ background: "white", borderRadius: borderRadius.xl, padding: 24, boxShadow: shadows.card, border: `1px solid ${colors.neutral[100]}`, animationDelay: "300ms" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={18} color={colors.roles.checker.primary} /> Results Overview
            </h3>
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 20px" }}>
              <div style={{ position: "relative", width: 110, height: 110 }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="46" fill="none" stroke={colors.neutral[100]} strokeWidth="8" />
                  <circle cx="55" cy="55" r="46" fill="none"
                    stroke={passRate >= 90 ? colors.success : passRate >= 70 ? colors.warning : colors.danger}
                    strokeWidth="8" strokeDasharray={`${passRate * 2.89} ${289 - passRate * 2.89}`}
                    strokeDashoffset="72.2" strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: colors.text.primary }}>{passRate}%</span>
                  <span style={{ fontSize: 12, color: colors.neutral[500], fontWeight: 500 }}>Pass Rate</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MiniStat label="Lot Size" value={ins.lotSize} />
              <MiniStat label="Sample Size" value={ins.sampleSize} />
              <MiniStat label="Passed" value={totalPassed} color={colors.success} />
              <MiniStat label="Failed" value={totalFailed} color={totalFailed > 0 ? colors.danger : colors.success} />
            </div>
          </div>
        </div>

        {}
        <div className="ck-fade-in" style={{
          background: `linear-gradient(135deg, ${colors.roles.maker.light} 0%, white 100%)`,
          borderRadius: borderRadius.xl, padding: 24, boxShadow: shadows.card,
          border: `1px solid ${colors.primary}15`, marginBottom: 24, animationDelay: "350ms"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={18} color={colors.primary} /> Maker Details
              </h3>
              <div style={{ display: "flex", gap: 24, fontSize: 15, color: colors.text.secondary, marginTop: 10 }}>
                <span><strong>Name:</strong> {ins.makerName}</span>
                <span><strong>Dept:</strong> {ins.makerDept}</span>
                <span><strong>Date:</strong> {formatDateTime(ins.makerDate)}</span>
              </div>
            </div>
            {ins.rejectionCount > 0 && (
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: borderRadius.full,
                background: colors.dangerBg, color: colors.danger,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <RotateCcw size={14} /> Re-inspection #{ins.rejectionCount}
              </span>
            )}
          </div>
          {ins.makerRemarks && (
            <div style={{
              marginTop: 14, padding: "14px 18px", borderRadius: borderRadius.md,
              background: "white", border: `1px solid ${colors.border.light}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.neutral[500], marginBottom: 4 }}>Maker Remarks:</div>
              <p style={{ fontSize: 15, color: colors.text.primary, margin: 0, lineHeight: 1.6 }}>{ins.makerRemarks}</p>
            </div>
          )}
        </div>

        {}
        {ins.checkerRemarks && (
          <div className="ck-fade-in" style={{
            background: `linear-gradient(135deg, ${colors.roles.checker.light} 0%, white 100%)`,
            borderRadius: borderRadius.xl, padding: 24, boxShadow: shadows.card,
            border: `1px solid ${colors.roles.checker.primary}15`, marginBottom: 24, animationDelay: "380ms"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color={colors.roles.checker.primary} /> Checker Decision
            </h3>
            <div style={{ display: "flex", gap: 24, fontSize: 15, color: colors.text.secondary, marginBottom: 10, flexWrap: "wrap" }}>
              <span><strong>Reviewed by:</strong> {user.name}</span>
              <span><strong>Date:</strong> {formatDateTime(ins.checkerDate)}</span>
              <span style={{
                fontWeight: 700,
                color: ins.status === "approved" ? colors.success : colors.danger,
              }}>
                Decision: {ins.status === "approved" ? "APPROVED" : "REJECTED"}
              </span>
            </div>

            {}
            {ins.status === "rejected" && ins.rejectionCategory && (
              <div style={{
                display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap",
              }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: borderRadius.full,
                  background: colors.dangerBg, border: `1px solid ${colors.danger}20`,
                  fontSize: 13, fontWeight: 600, color: colors.danger,
                }}>
                  <AlertTriangle size={14} />
                  {REJECTION_CATEGORIES.find(c => c.id === ins.rejectionCategory)?.label || ins.rejectionCategory}
                </div>
                {ins.rejectionReason && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: borderRadius.full,
                    background: colors.neutral[50], border: `1px solid ${colors.border.default}`,
                    fontSize: 13, fontWeight: 500, color: colors.text.secondary,
                  }}>
                    {ins.rejectionReason}
                  </div>
                )}
              </div>
            )}

            <div style={{
              padding: "14px 18px", borderRadius: borderRadius.md,
              background: "white", border: `1px solid ${colors.border.light}`,
            }}>
              <p style={{ fontSize: 15, color: colors.text.primary, margin: 0, lineHeight: 1.6 }}>{ins.checkerRemarks}</p>
            </div>
          </div>
        )}

        {}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Microscope size={22} color={colors.primary} /> Inspection Stages & Results
        </h2>

        {ins.stages?.map((stage, stageIdx) => {
          const stageResult = getResultStyle(stage.result);
          const isExpanded = expandedStages[stageIdx] !== false;
          return (
            <div key={stageIdx} className="ck-fade-in" style={{
              background: "white", borderRadius: borderRadius.xl, marginBottom: 16,
              boxShadow: shadows.card, border: `1px solid ${colors.neutral[100]}`,
              overflow: "hidden", animationDelay: `${400 + stageIdx * 100}ms`,
            }}>
              {}
              <button onClick={() => toggleStage(stageIdx)} style={{
                width: "100%", padding: "18px 24px", background: "none", border: "none",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: isExpanded ? `1px solid ${colors.border.light}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: borderRadius.default,
                    background: stageResult.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {stage.result === "pass" ? <CheckCircle2 size={20} color={stageResult.color} /> : <XCircle size={20} color={stageResult.color} />}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: colors.text.primary }}>{stage.stageName}</div>
                    <div style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2 }}>
                      {stage.stageType === "visual" ? "Visual Check" : "Measurement / Functional"} — {stage.checkpoints?.length || 0} checkpoints
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
                    <span style={{ color: colors.success, fontWeight: 600 }}>✓ {stage.totalPassed} passed</span>
                    {stage.totalFailed > 0 && <span style={{ color: colors.danger, fontWeight: 600 }}>✗ {stage.totalFailed} failed</span>}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, padding: "5px 14px", borderRadius: borderRadius.full,
                    background: stageResult.bg, color: stageResult.color, textTransform: "uppercase",
                  }}>{stage.result}</span>
                  {isExpanded ? <ChevronUp size={18} color={colors.neutral[400]} /> : <ChevronDown size={18} color={colors.neutral[400]} />}
                </div>
              </button>

              {}
              {isExpanded && (
                <div style={{ padding: "16px 24px 20px" }}>
                  {stage.checkpoints?.map((cp, cpIdx) => (
                    <CheckpointDetail key={cpIdx} checkpoint={cp} stageType={stage.stageType} index={cpIdx} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {}
        {isPending && (
          <div className="ck-slide-up" style={{
            position: "sticky", bottom: 0, left: 0, right: 0,
            background: "white", borderTop: `1px solid ${colors.border.light}`,
            padding: "16px 32px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
            zIndex: 50,
          }}>
            <div style={{ fontSize: 15, color: colors.text.secondary }}>
              <strong>{ins.partName}</strong> — {ins.irNumber}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onReject} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: borderRadius.default,
                border: `2px solid ${colors.danger}`, background: "white",
                color: colors.danger, fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}>
                <ThumbsDown size={18} /> Reject & Return to Maker
              </button>
              <button onClick={onApprove} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 32px", borderRadius: borderRadius.default,
                border: "none", background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successDark} 100%)`,
                color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: `0 4px 14px ${colors.success}40`,
              }}>
                <ThumbsUp size={18} /> Approve Inspection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const CheckpointDetail = ({ checkpoint, stageType, index }) => {
  const cp = checkpoint;
  const isVisual = cp.type === "visual";

  if (isVisual) {
    const okCount = cp.results?.filter(r => r === "OK").length || 0;
    const ngCount = cp.results?.filter(r => r === "NG").length || 0;
    const total = cp.results?.length || 0;
    const allPass = ngCount === 0 && okCount > 0;

    return (
      <div style={{
        padding: "14px 18px", borderRadius: borderRadius.md, marginBottom: 10,
        border: `1px solid ${allPass ? colors.success + "20" : colors.danger + "20"}`,
        background: allPass ? colors.successBg : ngCount > 0 ? colors.dangerBg : colors.neutral[50],
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary }}>{cp.name}</span>
            <span style={{ fontSize: 13, color: colors.text.tertiary, marginLeft: 10 }}>{cp.specification}</span>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: borderRadius.full,
            background: allPass ? colors.successBg : colors.dangerBg,
            color: allPass ? colors.success : colors.danger,
          }}>
            {okCount}/{total} OK
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {cp.results?.map((r, i) => (
            <span key={i} style={{
              width: 36, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: borderRadius.sm, fontSize: 12, fontWeight: 700,
              background: r === "OK" ? colors.successBg : colors.dangerBg,
              color: r === "OK" ? colors.success : colors.danger,
              border: `1px solid ${r === "OK" ? colors.success + "30" : colors.danger + "30"}`,
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>
    );
  }


  const results = cp.results || [];
  const failedSamples = results.filter((v) => v < cp.min || v > cp.max);
  const allPass = failedSamples.length === 0;

  return (
    <div style={{
      padding: "14px 18px", borderRadius: borderRadius.md, marginBottom: 10,
      border: `1px solid ${allPass ? colors.success + "20" : colors.danger + "20"}`,
      background: allPass ? `${colors.success}05` : `${colors.danger}05`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary }}>{cp.name}</span>
          <span style={{ fontSize: 13, color: colors.text.tertiary, marginLeft: 10 }}>{cp.specification}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {cp.nominal !== undefined && (
            <span style={{ fontSize: 13, color: colors.neutral[500] }}>
              Nominal: <strong>{cp.nominal} {cp.unit}</strong> [{cp.min} – {cp.max}]
            </span>
          )}
          <span style={{
            fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: borderRadius.full,
            background: allPass ? colors.successBg : colors.dangerBg,
            color: allPass ? colors.success : colors.danger,
          }}>
            {results.length - failedSamples.length}/{results.length} Pass
          </span>
        </div>
      </div>
      {}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {results.map((val, i) => {
            const isFail = val < cp.min || val > cp.max;
            return (
              <div key={i} style={{
                minWidth: 62, padding: "6px 8px", textAlign: "center",
                borderRadius: borderRadius.sm, fontSize: 13, fontWeight: 600,
                background: isFail ? colors.dangerBg : colors.successBg,
                color: isFail ? colors.danger : colors.success,
                border: `1px solid ${isFail ? colors.danger + "25" : colors.success + "25"}`,
              }}>
                <div style={{ fontSize: 10, color: colors.neutral[500], fontWeight: 500, marginBottom: 2 }}>S{i + 1}</div>
                {val} {cp.unit}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const REJECTION_CATEGORIES = [
  { id: "functional_failure", label: "Functional Failure", description: "Component failed functional/electrical test" },
  { id: "dimensional_deviation", label: "Dimensional Deviation", description: "Measurements outside tolerance limits" },
  { id: "cosmetic_defect", label: "Cosmetic / Visual Defect", description: "Surface defects, scratches, discoloration" },
  { id: "material_defect", label: "Material Defect", description: "Incorrect material, impurities, degradation" },
  { id: "labeling_issue", label: "Labeling / Marking Issue", description: "Missing or incorrect labels, markings, or certificates" },
  { id: "packaging_damage", label: "Packaging / Transit Damage", description: "Damage during shipping or handling" },
  { id: "documentation_mismatch", label: "Documentation Mismatch", description: "COA, test reports, or specs don't match" },
  { id: "contamination", label: "Contamination", description: "Foreign particles, residues, or biological contamination" },
  { id: "other", label: "Other", description: "Specify in remarks" },
];

const ActionModal = ({ type, inspection, remarks, setRemarks, rejectionCategory, setRejectionCategory, rejectionReason, setRejectionReason, processing, onConfirm, onCancel }) => {
  const isApprove = type === "approve";
  const accentColor = isApprove ? colors.success : colors.danger;
  const Icon = isApprove ? ThumbsUp : ThumbsDown;
  const canSubmitReject = remarks.trim() && rejectionCategory;
  const canSubmit = isApprove ? remarks.trim() : canSubmitReject;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onCancel}>
      <div className="ck-scale-in" onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: borderRadius.xl, width: 580,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: shadows.xl, overflow: "hidden",
      }}>
        {}
        <div style={{
          padding: "24px 28px 20px", borderBottom: `1px solid ${colors.border.light}`,
          background: `linear-gradient(135deg, ${accentColor}08 0%, white 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: borderRadius.lg,
              background: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={24} color={accentColor} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, margin: 0 }}>
                {isApprove ? "Approve Inspection" : "Reject Inspection"}
              </h2>
              <p style={{ fontSize: 14, color: colors.text.tertiary, margin: "4px 0 0" }}>
                {inspection.irNumber} — {inspection.partName}
              </p>
            </div>
          </div>
        </div>

        {}
        <div style={{ padding: "20px 28px 24px" }}>
          {!isApprove && (
            <>
              {}
              <div style={{
                padding: "14px 16px", borderRadius: borderRadius.md,
                background: colors.warningBg, border: `1px solid ${colors.warning}20`,
                marginBottom: 20, display: "flex", gap: 10,
              }}>
                <AlertTriangle size={18} color={colors.warning} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 14, color: colors.warningDark, lineHeight: 1.5 }}>
                  <strong>This inspection will be sent back to the Maker ({inspection.makerName})</strong> for re-inspection.
                  Please select a rejection reason and provide detailed remarks.
                </div>
              </div>

              {}
              <label style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, display: "block", marginBottom: 8 }}>
                Rejection Category <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                value={rejectionCategory}
                onChange={e => setRejectionCategory(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: borderRadius.md, border: `1px solid ${colors.border.default}`,
                  fontSize: 15, fontFamily: "inherit", color: rejectionCategory ? colors.text.primary : colors.text.tertiary,
                  background: "white", outline: "none", cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                  transition: "border-color .2s",
                }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = colors.border.default}
              >
                <option value="">— Select rejection reason —</option>
                {REJECTION_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              {rejectionCategory && (
                <p style={{ fontSize: 13, color: colors.text.tertiary, margin: "6px 0 0", fontStyle: "italic" }}>
                  {REJECTION_CATEGORIES.find(c => c.id === rejectionCategory)?.description}
                </p>
              )}
              {!rejectionCategory && (
                <p style={{ fontSize: 13, color: colors.danger, margin: "6px 0 0" }}>
                  Please select a rejection category
                </p>
              )}

              {}
              <label style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, display: "block", marginBottom: 8, marginTop: 18 }}>
                Specific Reason / Summary
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g., Output voltage outside tolerance on 40% of samples"
                style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: borderRadius.md, border: `1px solid ${colors.border.default}`,
                  fontSize: 15, fontFamily: "inherit", color: colors.text.primary,
                  outline: "none", transition: "border-color .2s",
                }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = colors.border.default}
              />

              <div style={{ borderTop: `1px solid ${colors.border.light}`, margin: "20px 0 18px" }} />
            </>
          )}

          <label style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, display: "block", marginBottom: 8 }}>
            {isApprove ? "Checker Remarks" : "Detailed Remarks for Maker"} <span style={{ color: colors.danger }}>*</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder={isApprove
              ? "e.g., Verified all results. Test values within tolerance. Approved for store transfer."
              : "e.g., Output voltage readings on samples #4, #15, #23 are 3.80V, 3.85V, 3.78V respectively — outside 3.3V ± 0.1V tolerance. Re-inspect with calibrated voltmeter (CAL-VM-003). Check component R47 solder joints."
            }
            rows={isApprove ? 4 : 5}
            style={{
              width: "100%", minHeight: isApprove ? 100 : 120, padding: "14px 16px",
              borderRadius: borderRadius.md, border: `1px solid ${colors.border.default}`,
              fontSize: 15, fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
              color: colors.text.primary, outline: "none",
              transition: "border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = accentColor}
            onBlur={e => e.target.style.borderColor = colors.border.default}
          />
          {!remarks.trim() && (
            <p style={{ fontSize: 13, color: colors.danger, margin: "6px 0 0" }}>
              Remarks are required to proceed
            </p>
          )}

          {}
          <p style={{ fontSize: 12, color: colors.neutral[400], margin: "6px 0 0", textAlign: "right" }}>
            {remarks.length} characters
          </p>
        </div>

        {}
        <div style={{
          padding: "16px 28px 20px", borderTop: `1px solid ${colors.border.light}`,
          display: "flex", justifyContent: "flex-end", gap: 10, background: colors.neutral[50],
        }}>
          <button onClick={onCancel} disabled={processing} style={{
            padding: "10px 24px", borderRadius: borderRadius.default,
            border: `1px solid ${colors.border.default}`, background: "white",
            color: colors.text.secondary, fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!canSubmit || processing} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 28px", borderRadius: borderRadius.default,
            border: "none", background: !canSubmit ? colors.neutral[300] : accentColor,
            color: "white", fontSize: 15, fontWeight: 600,
            cursor: !canSubmit ? "not-allowed" : "pointer",
            opacity: processing ? 0.7 : 1,
            transition: "all .2s",
          }}>
            {processing ? <Loader2 size={18} className="ck-spin" /> : <Icon size={18} />}
            {processing ? "Processing..." : isApprove ? "Confirm Approval" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};


const InfoRow = ({ label, value, highlight, capitalize }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 14, color: colors.text.tertiary }}>{label}</span>
    <span style={{
      fontSize: 14, fontWeight: 600,
      color: highlight === "danger" ? colors.danger : highlight === "success" ? colors.success : colors.text.primary,
      textTransform: capitalize ? "capitalize" : "none",
    }}>{value || "—"}</span>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div style={{
    padding: "10px 14px", borderRadius: borderRadius.default,
    background: colors.neutral[50], textAlign: "center",
  }}>
    <div style={{ fontSize: 12, color: colors.neutral[500], marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: color || colors.text.primary }}>{value}</div>
  </div>
);
