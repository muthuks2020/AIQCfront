

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  User,
  Loader,
  RefreshCw,
} from 'lucide-react';
import { Header, Card, StatCard, Button, Badge } from '../../components/common';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getInspectionQueue } from '../../api/inspectionService';   // ✅ FIX #5: Import API


const MakerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({
    total_pending: 0,
    total_in_progress: 0,
    total_on_hold: 0,
    total_completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInspectionQueue();

      // API returns: { success, data: [...], summary: {...}, meta: {...} }
      const queueItems = response.data || response || [];
      const queueSummary = response.summary || {};

      // Map backend fields → what our JobCard component expects
      const mapped = queueItems.map((item) => ({
    
        id:               item.id,
        queueNumber:      item.queue_number,
        batchNo:          item.queue_number || `Q-${item.id}`,
        productName:      item.component?.part_name || 'Unknown Component',
        partCode:         item.component?.part_code || '',
        poNumber:         item.grn?.grn_number || '',
        vendor:           item.vendor?.vendor_name || '',
        quantity:          item.lot_size,
        samplingQty:      item.sample_size,
        priority:         item.priority <= 2 ? 'high' : item.priority <= 4 ? 'normal' : 'low',
        status:           item.status,
        dueDate:          item.grn?.grn_date,
        checkpoints:      0, // Will be known after loading the form
        grnDate:          item.grn?.grn_date,
        vendorInvoiceNo:  item.vendor?.vendor_code || '',
        vendorDate:       item.grn?.grn_date,
        serviceDate:      null,
        assignedTo:       item.assigned_to,
        daysInQuarantine: item.days_in_quarantine,
        isOverdue:        item.is_overdue,
        createdAt:        item.created_at,
      }));

      setJobs(mapped);
      setSummary(queueSummary);
    } catch (err) {
      console.error('[MakerDashboard] Failed to fetch queue:', err);
      setError(err.message || 'Failed to load inspection queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ── Stats from real API summary ───────────────────────────────────────────
  const stats = [
    { label: 'Pending Jobs',    value: String(summary.total_pending || 0),     change: 'Awaiting start',  icon: ClipboardList, color: colors.primary },
    { label: 'In Progress',     value: String(summary.total_in_progress || 0), change: 'Active now',      icon: Clock,         color: colors.warning },
    { label: 'On Hold',         value: String(summary.total_on_hold || 0),     change: 'Needs attention', icon: AlertTriangle, color: colors.danger || '#EF4444' },
    { label: 'Completed',       value: String(summary.total_completed || 0),   change: 'Done',            icon: CheckCircle2,  color: colors.success },
  ];

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.status === filter);

  // ── Navigation ────────────────────────────────────────────────────────────
  // ✅ FIX #6: Pass numeric id (e.g. 8) so the detail page calls
  //    GET /api/v1/inspection/queue/8 (not /inspection/INS-2026-0354)
  const handleStartInspection = (jobId) => {
    navigate(`/maker/inspection/${jobId}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <Header
        title="QC Workstation"
        subtitle={`Good ${getGreeting()}, ${user?.name || 'QC Inspector'}! Here's your inspection queue.`}
        showSearch
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button icon={RefreshCw} variant="outline" onClick={fetchQueue} disabled={loading}>
              Refresh
            </Button>
            <Button icon={PlayCircle} onClick={() => alert('Scan QR to start')}>
              Quick Start
            </Button>
          </div>
        }
      />

      <div style={styles.content}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Inspection Queue */}
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

          {/* Loading state */}
          {loading && (
            <Card>
              <div style={styles.emptyState}>
                <Loader size={40} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ marginTop: 16 }}>Loading inspection queue...</h3>
              </div>
            </Card>
          )}

          {/* Error state */}
          {error && !loading && (
            <Card>
              <div style={styles.emptyState}>
                <AlertTriangle size={48} color={colors.danger || '#EF4444'} />
                <h3>Failed to Load Queue</h3>
                <p style={{ color: colors.neutral[500] }}>{error}</p>
                <Button icon={RefreshCw} onClick={fetchQueue} style={{ marginTop: 12 }}>
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Job list */}
          {!loading && !error && (
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
          )}
        </section>

        {/* Quick Stats Row */}
        <div style={styles.quickStatsRow}>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <Timer size={20} color={colors.primary} />
              </div>
              <div>
                <span style={styles.quickStatValue}>{jobs.length}</span>
                <span style={styles.quickStatLabel}>Total Queue Items</span>
              </div>
            </div>
          </Card>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <Package size={20} color={colors.success} />
              </div>
              <div>
                <span style={styles.quickStatValue}>{summary.total_completed || 0}</span>
                <span style={styles.quickStatLabel}>Completed Inspections</span>
              </div>
            </div>
          </Card>
          <Card>
            <div style={styles.quickStat}>
              <div style={styles.quickStatIcon}>
                <AlertTriangle size={20} color={colors.warning} />
              </div>
              <div>
                <span style={styles.quickStatValue}>{jobs.filter(j => j.isOverdue).length}</span>
                <span style={styles.quickStatLabel}>Overdue Items</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


// =============================================================================
// JobCard Component
// =============================================================================
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
        <span style={styles.jobDueDate}>
          {job.daysInQuarantine != null
            ? `${job.daysInQuarantine} day${job.daysInQuarantine !== 1 ? 's' : ''} in quarantine`
            : `Due: ${formatDate(job.dueDate)}`
          }
        </span>
      </div>

      <div style={styles.jobMain}>
        <div style={styles.jobInfo}>
          <h3 style={styles.jobTitle}>{job.productName}</h3>
          <div style={styles.jobMeta}>
            {job.partCode && <span><strong>Part:</strong> {job.partCode}</span>}
            <span><strong>Batch:</strong> {job.batchNo}</span>
            {job.poNumber && <span><strong>GRN:</strong> {job.poNumber}</span>}
            {job.vendor && <span><strong>Vendor:</strong> {job.vendor}</span>}
            {job.grnDate && <span><strong>GRN Date:</strong> {formatDate(job.grnDate)}</span>}
            {job.assignedTo && <span><strong>Assigned:</strong> {job.assignedTo}</span>}
            {!job.grnDate && (
              <span style={{ color: colors.danger || '#EF4444', fontSize: '11px', fontWeight: 600 }}>
                ⚠ GRN Date missing
              </span>
            )}
          </div>
        </div>

        <div style={styles.jobStats}>
          <div style={styles.jobStatItem}>
            <span style={styles.jobStatValue}>{job.quantity || '-'}</span>
            <span style={styles.jobStatLabel}>Total Qty</span>
          </div>
          <div style={styles.jobStatItem}>
            <span style={styles.jobStatValue}>{job.samplingQty || '-'}</span>
            <span style={styles.jobStatLabel}>Sample Size</span>
          </div>
          {job.checkpoints > 0 && (
            <div style={styles.jobStatItem}>
              <span style={styles.jobStatValue}>{job.checkpoints}</span>
              <span style={styles.jobStatLabel}>Checkpoints</span>
            </div>
          )}
        </div>
      </div>

      {isInProgress && progress > 0 && (
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


// =============================================================================
// Helpers
// =============================================================================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Invalid Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};


// =============================================================================
// Styles
// =============================================================================
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
