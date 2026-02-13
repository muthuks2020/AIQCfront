import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlayCircle,
  AlertTriangle,
  Package,
  ChevronRight,
  Timer,
  User
} from 'lucide-react';
import { Header, Card, StatCard, Button, Badge } from '../../components/common';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';


const mockPendingJobs = [
  {
    "id": "INS-2026-0350",
    "jobId": "JOB-AACS-173",
    "batchNo": "25-12-002",
    "productName": "3PIN GILLARD MALE & FEMALE",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2025-12-27T09:00:00",
    "checkpoints": 3,
    "passedCheckpoints": 3,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "All checkpoints passed. Visual inspection completed."
  },
  {
    "id": "INS-2026-0302",
    "jobId": "JOB-RCNA-001",
    "batchNo": "26-01-001",
    "productName": "CHANNEL FRAME - REGULAR",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-14T09:30:00",
    "checkpoints": 20,
    "passedCheckpoints": 20,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "high",
    "notes": "Comprehensive dimensional inspection completed. All 18 measurement checkpoints within tolerance."
  },
  {
    "id": "INS-2026-0352",
    "jobId": "JOB-RCNA-011",
    "batchNo": "26-01-002",
    "productName": "CHANNEL CORRUGATED BOX-R",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-09T10:00:00",
    "checkpoints": 6,
    "passedCheckpoints": 6,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "Packaging material inspection. Dimensions and ply count verified."
  },
  {
    "id": "VAL-004",
    "jobId": "JOB-RCNA-034",
    "batchNo": "25-11-001",
    "productName": "BEARING-6008",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2025-11-26T09:00:00",
    "checkpoints": 3,
    "passedCheckpoints": 3,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "Visual inspection for bearing part number and damage check completed."
  },
  {
    "id": "INS-2026-0353",
    "jobId": "JOB-RCNA-035",
    "batchNo": "26-01-003",
    "productName": "90 DEGREE LOCK & NUT",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-13T09:30:00",
    "checkpoints": 10,
    "passedCheckpoints": 10,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "high",
    "notes": "Precision dimensional inspection completed. All measurements within specified tolerances."
  },
  {
    "id": "INS-2026-0354",
    "jobId": "JOB-RCNA-104",
    "batchNo": "25-11-001",
    "productName": "EC REP STICKER",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2025-11-13T09:00:00",
    "checkpoints": 3,
    "passedCheckpoints": 3,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "Artwork verification and visual inspection completed."
  },
  {
    "id": "VAL-007",
    "jobId": "JOB-RSFA-061",
    "batchNo": "26-01-001",
    "productName": "3M.M HD WASHER",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-09T10:30:00",
    "checkpoints": 5,
    "passedCheckpoints": 5,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "Washer dimensional inspection - inner/outer diameter and thickness verified."
  },
  {
    "id": "VAL-008",
    "jobId": "JOB-EEWA-029",
    "batchNo": "26-01-002",
    "productName": "2 CORE WIRE COIL-23/60 T.F.R",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-19T09:00:00",
    "checkpoints": 3,
    "passedCheckpoints": 3,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "normal",
    "notes": "Electrical wire coil specification and damage check completed."
  },
  {
    "id": "INS-2026-0228",
    "jobId": "JOB-EETD-034",
    "batchNo": "26-01-003",
    "productName": "29V/3A TRANSFORMER",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-13T11:00:00",
    "checkpoints": 6,
    "passedCheckpoints": 6,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "high",
    "notes": "Electrical output voltage testing completed. All voltage outputs within tolerance."
  },
  {
    "id": "INS-2026-0276",
    "jobId": "JOB-RUBA-001",
    "batchNo": "26-01-001",
    "productName": "M.S BASE PLATE",
    "maker": "Radhakrishnan.S",
    "makerDept": "QC Department",
    "submittedAt": "2026-01-14T10:00:00",
    "checkpoints": 10,
    "passedCheckpoints": 10,
    "failedCheckpoints": 0,
    "status": "approved",
    "priority": "high",
    "notes": "Metal base plate dimensional inspection. All measurements verified."
  },
  {
    id: 'JOB-003',
    batchNo: 'BATCH-2026-003',
    productName: 'Display Panel Module',
    poNumber: 'PO-2026-0135',
    vendor: 'TechDisplay Corp',
    quantity: 200,
    samplingQty: 32,
    priority: 'low',
    status: 'pending',
    dueDate: '2026-02-05',
    checkpoints: 15,
  },
];

const MakerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(mockPendingJobs);
  const [filter, setFilter] = useState('all');

  const stats = [
    { label: 'Pending Jobs', value: '8', change: '+3 today', icon: ClipboardList, color: colors.primary },
    { label: 'In Progress', value: '2', change: 'Active now', icon: Clock, color: colors.warning },
    { label: 'Completed Today', value: '12', change: '+15% vs avg', icon: CheckCircle2, color: colors.success },
    { label: 'Pass Rate', value: '96.5%', change: '+1.2%', icon: TrendingUp, color: colors.accent },
  ];

  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.status === filter);

  const handleStartInspection = (jobId) => {

    window.location.href = `/maker/inspection/${jobId}`;
  };

  return (
    <div style={styles.page}>
      <Header
        title="QC Workstation"
        subtitle={`Good ${getGreeting()}, ${user?.name || 'QC Inspector'}! Here's your inspection queue.`}
        showSearch
        actions={
          <Button icon={PlayCircle} onClick={() => alert('Scan QR to start')}>
            Quick Start
          </Button>
        }
      />

      <div style={styles.content}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Inspection Queue</h2>
            <div style={styles.filterButtons}>
              {['all', 'pending', 'in_progress'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    ...styles.filterButton,
                    background: filter === status ? colors.primary : 'transparent',
                    color: filter === status ? 'white' : colors.neutral[600],
                    borderColor: filter === status ? colors.primary : colors.neutral[200],
                  }}
                >
                  {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>

          {}
          <div style={styles.jobsList}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStart={() => handleStartInspection(job.id)}
              />
            ))}

            {filteredJobs.length === 0 && (
              <Card>
                <div style={styles.emptyState}>
                  <CheckCircle2 size={48} color={colors.success} />
                  <h3>All Caught Up!</h3>
                  <p>No pending inspections matching your filter.</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {}
        <div style={styles.quickStatsRow}>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <Timer size={20} color={colors.primary} />
              </div>
              <div>
                <span style={styles.quickStatValue}>4.2 hrs</span>
                <span style={styles.quickStatLabel}>Avg. Inspection Time</span>
              </div>
            </div>
          </Card>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <Package size={20} color={colors.success} />
              </div>
              <div>
                <span style={styles.quickStatValue}>156</span>
                <span style={styles.quickStatLabel}>Batches This Month</span>
              </div>
            </div>
          </Card>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <AlertTriangle size={20} color={colors.warning} />
              </div>
              <div>
                <span style={styles.quickStatValue}>3</span>
                <span style={styles.quickStatLabel}>Issues Found Today</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


const JobCard = ({ job, onStart }) => {
  const isInProgress = job.status === 'in_progress';
  const progress = isInProgress && job.completedCheckpoints
    ? Math.round((job.completedCheckpoints / job.checkpoints) * 100)
    : 0;

  return (
    <Card hover onClick={onStart} style={styles.jobCard}>
      <div style={styles.jobHeader}>
        <div style={styles.jobBadges}>
          <Badge type="priority" value={job.priority} size="sm" />
          <Badge type="status" value={job.status} size="sm" dot />
        </div>
        <span style={styles.jobDueDate}>Due: {formatDate(job.dueDate)}</span>
      </div>

      <div style={styles.jobMain}>
        <div style={styles.jobInfo}>
          <h3 style={styles.jobTitle}>{job.productName}</h3>
          <div style={styles.jobMeta}>
            <span><strong>Batch:</strong> {job.batchNo}</span>
            <span><strong>PO:</strong> {job.poNumber}</span>
            <span><strong>Vendor:</strong> {job.vendor}</span>
          </div>
        </div>

        <div style={styles.jobStats}>
          <div style={styles.jobStatItem}>
            <span style={styles.jobStatValue}>{job.quantity}</span>
            <span style={styles.jobStatLabel}>Total Qty</span>
          </div>
          <div style={styles.jobStatItem}>
            <span style={styles.jobStatValue}>{job.samplingQty}</span>
            <span style={styles.jobStatLabel}>Sample Size</span>
          </div>
          <div style={styles.jobStatItem}>
            <span style={styles.jobStatValue}>{job.checkpoints}</span>
            <span style={styles.jobStatLabel}>Checkpoints</span>
          </div>
        </div>
      </div>

      {isInProgress && (
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressText}>{progress}% Complete</span>
        </div>
      )}

      <div style={styles.jobFooter}>
        <Button
          variant={isInProgress ? 'primary' : 'outline'}
          size="sm"
          icon={isInProgress ? PlayCircle : ChevronRight}
          iconPosition="right"
        >
          {isInProgress ? 'Continue' : 'Start Inspection'}
        </Button>
      </div>
    </Card>
  );
};


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const styles = {
  page: {
    minHeight: '100vh',
    background: colors.neutral[50],
  },

  content: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: 0,
  },

  filterButtons: {
    display: 'flex',
    gap: '8px',
  },

  filterButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: borderRadius.md,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  jobCard: {
    cursor: 'pointer',
  },

  jobHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },

  jobBadges: {
    display: 'flex',
    gap: '8px',
  },

  jobDueDate: {
    fontSize: '12px',
    color: colors.neutral[500],
    fontWeight: 500,
  },

  jobMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
  },

  jobInfo: {
    flex: 1,
  },

  jobTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: '0 0 8px',
  },

  jobMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '13px',
    color: colors.neutral[600],
  },

  jobStats: {
    display: 'flex',
    gap: '24px',
  },

  jobStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 16px',
    background: colors.neutral[50],
    borderRadius: borderRadius.md,
    minWidth: '80px',
  },

  jobStatValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.neutral[800],
  },

  jobStatLabel: {
    fontSize: '11px',
    color: colors.neutral[500],
    marginTop: '2px',
  },

  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.neutral[100]}`,
  },

  progressBar: {
    flex: 1,
    height: '6px',
    background: colors.neutral[100],
    borderRadius: '3px',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  progressText: {
    fontSize: '12px',
    fontWeight: 500,
    color: colors.primary,
    minWidth: '80px',
    textAlign: 'right',
  },

  jobFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.neutral[100]}`,
  },

  quickStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  quickStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  quickStatIcon: {
    width: '44px',
    height: '44px',
    borderRadius: borderRadius.lg,
    background: colors.neutral[50],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickStatValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: 700,
    color: colors.neutral[800],
  },

  quickStatLabel: {
    display: 'block',
    fontSize: '12px',
    color: colors.neutral[500],
  },

  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
};

export default MakerDashboard;
