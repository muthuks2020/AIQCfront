import React from 'react';
import {
  Users,
  Boxes,
  Package,
  BarChart3,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Header, Card, StatCard, Button } from '../../components/common';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '24', change: '+3 this month', icon: Users, color: colors.roles.admin.primary },
    { label: 'Sampling Plans', value: '156', change: '+12 active', icon: Boxes, color: colors.primary },
    { label: 'Components', value: '1,248', change: '+45 new', icon: Package, color: colors.success },
    { label: 'QC Completion', value: '94.2%', change: '+2.1%', icon: TrendingUp, color: colors.accent },
  ];

  const quickActions = [
    { label: 'Sampling Master', description: 'Configure sampling plans and AQL levels', icon: Boxes, path: '/admin/sampling-master', color: colors.primary },
    { label: 'Component Master', description: 'Manage component specifications', icon: Package, path: '/admin/component-master', color: colors.success },
    { label: 'User Management', description: 'Add, edit, or deactivate users', icon: Users, path: '/admin/users', color: colors.roles.admin.primary },
    { label: 'System Settings', description: 'Configure application settings', icon: Settings, path: '/admin/settings', color: colors.neutral[600] },
  ];

  const recentActivity = [
    { id: 1, action: 'New sampling plan created', user: 'Admin', time: '2 hours ago', type: 'create' },
    { id: 2, action: 'Component BSC-001 updated', user: 'Admin', time: '4 hours ago', type: 'update' },
    { id: 3, action: 'User Ravi Kumar activated', user: 'Admin', time: '1 day ago', type: 'user' },
    { id: 4, action: 'AQL level modified for Plan-15', user: 'Admin', time: '2 days ago', type: 'update' },
  ];

  return (
    <div style={styles.page}>
      <Header
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Administrator'}! Here's your system overview.`}
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
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Card key={index} hover onClick={() => window.location.href = action.path}>
                <div style={styles.actionCard}>
                  <div style={{ ...styles.actionIcon, background: `${action.color}10`, color: action.color }}>
                    <action.icon size={24} />
                  </div>
                  <div style={styles.actionContent}>
                    <h3 style={styles.actionTitle}>{action.label}</h3>
                    <p style={styles.actionDescription}>{action.description}</p>
                  </div>
                  <ArrowRight size={20} style={{ color: colors.neutral[400] }} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {}
        <div style={styles.twoColumn}>
          {}
          <Card>
            <h3 style={styles.cardTitle}>Recent Activity</h3>
            <div style={styles.activityList}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={{
                    ...styles.activityDot,
                    background: activity.type === 'create' ? colors.success :
                               activity.type === 'user' ? colors.roles.admin.primary : colors.primary,
                  }} />
                  <div style={styles.activityContent}>
                    <span style={styles.activityAction}>{activity.action}</span>
                    <span style={styles.activityMeta}>by {activity.user} • {activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" fullWidth style={{ marginTop: '16px' }}>
              View All Activity
            </Button>
          </Card>

          {}
          <Card>
            <h3 style={styles.cardTitle}>System Health</h3>
            <div style={styles.healthList}>
              <HealthItem label="Database Connection" status="healthy" />
              <HealthItem label="Odoo Integration" status="healthy" />
              <HealthItem label="API Response Time" status="healthy" value="45ms" />
              <HealthItem label="Background Jobs" status="warning" value="2 pending" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const HealthItem = ({ label, status, value }) => (
  <div style={styles.healthItem}>
    <div style={styles.healthLabel}>
      {status === 'healthy' ? (
        <CheckCircle2 size={16} color={colors.success} />
      ) : status === 'warning' ? (
        <AlertCircle size={16} color={colors.warning} />
      ) : (
        <AlertCircle size={16} color={colors.danger} />
      )}
      <span>{label}</span>
    </div>
    <span style={{
      ...styles.healthValue,
      color: status === 'healthy' ? colors.success :
             status === 'warning' ? colors.warning : colors.danger,
    }}>
      {value || (status === 'healthy' ? 'Operational' : 'Issue')}
    </span>
  </div>
);

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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: 0,
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },

  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  actionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: 0,
  },

  actionDescription: {
    fontSize: '13px',
    color: colors.neutral[500],
    margin: '4px 0 0',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: '0 0 20px',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },

  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },

  activityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  activityAction: {
    fontSize: '14px',
    color: colors.neutral[700],
  },

  activityMeta: {
    fontSize: '12px',
    color: colors.neutral[400],
  },

  healthList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  healthItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: colors.neutral[50],
    borderRadius: borderRadius.md,
  },

  healthLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: colors.neutral[700],
  },

  healthValue: {
    fontSize: '13px',
    fontWeight: 500,
  },
};

export default AdminDashboard;
