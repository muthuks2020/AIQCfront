import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ClipboardList,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Layers,
  Award,
  Building2,
  Package,
  Activity,
  TrendingUp,
  Shield,
  Loader2,
} from 'lucide-react';


import {
  fetchSamplingPlans,
  fetchQualityPlans,
  deleteSamplingPlan,
  deleteQualityPlan,
  SAMPLING_API_CONFIG,
} from './api/samplingMasterApi';


import './styles/SamplingMaster.css';


const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    cursor: 'default',
  }}>
    <div style={{
      width: '52px',
      height: '52px',
      borderRadius: '12px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
    }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1E293B' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{label}</div>
    </div>
    {trend && (
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#10B981',
        fontSize: '12px',
        fontWeight: '600',
      }}>
        <TrendingUp size={14} />
        {trend}
      </div>
    )}
  </div>
);


const PlanCard = ({ plan, type, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const isSampling = type === 'sampling';
  const icon = isSampling ? Target : ClipboardList;
  const Icon = icon;
  const color = isSampling ? '#003366' : '#059669';

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      position: 'relative',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {}
      <div style={{ height: '4px', background: color }} />

      {/* Card Content */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: `${color}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}>
            <Icon size={22} />
          </div>

          {}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
              }}
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '8px',
                minWidth: '140px',
                zIndex: 100,
              }}>
                <button
                  onClick={() => { onView(plan); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#334155',
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => { onEdit(plan); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#334155',
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => { onDelete(plan); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#EF4444',
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#FEE2E2'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#1E293B',
          marginBottom: '6px',
        }}>
          {isSampling ? plan.samplePlanNo : plan.qcPlanNo}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '16px',
          lineHeight: '1.4',
        }}>
          {isSampling ? plan.samplePlanTypeName : plan.productName}
        </p>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {isSampling ? (
            <>
              <span style={{
                padding: '4px 10px',
                background: '#E6EEF5',
                color: '#003366',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {plan.samplePlanType}
              </span>
              <span style={{
                padding: '4px 10px',
                background: '#E6F7FC',
                color: '#0080B3',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {plan.iterations} Iterations
              </span>
              <span style={{
                padding: '4px 10px',
                background: '#F1F5F9',
                color: '#64748B',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {plan.lotRanges?.length || 0} Ranges
              </span>
            </>
          ) : (
            <>
              <span style={{
                padding: '4px 10px',
                background: '#D1FAE5',
                color: '#059669',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {plan.documentRevNo}
              </span>
              <span style={{
                padding: '4px 10px',
                background: '#F1F5F9',
                color: '#64748B',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {plan.departmentName}
              </span>
            </>
          )}
        </div>
      </div>

      {}
      <button
        onClick={() => onView(plan)}
        style={{
          width: '100%',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: 'none',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          cursor: 'pointer',
          color: color,
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = color;
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#F8FAFC';
          e.target.style.color = color;
        }}
      >
        View Details <ChevronRight size={16} />
      </button>
    </div>
  );
};


const SamplingMasterPage = () => {
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState('sampling');
  const [samplingPlans, setSamplingPlans] = useState([]);
  const [qualityPlans, setQualityPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [samplingResponse, qualityResponse] = await Promise.all([
        fetchSamplingPlans(),
        fetchQualityPlans(),
      ]);

      if (samplingResponse.success) {
        setSamplingPlans(samplingResponse.data || []);
      }
      if (qualityResponse.success) {
        setQualityPlans(qualityResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };


  const filteredSamplingPlans = samplingPlans.filter(plan =>
    plan.samplePlanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.samplePlanTypeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQualityPlans = qualityPlans.filter(plan =>
    plan.qcPlanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleCreateSamplingPlan = () => {
    navigate('/admin/sampling-master/sampling-plan/new');
  };

  const handleCreateQualityPlan = () => {
    navigate('/admin/sampling-master/quality-plan/new');
  };

  const handleEditSamplingPlan = (plan) => {
    navigate(`/admin/sampling-master/sampling-plan/edit/${plan.id}`);
  };

  const handleEditQualityPlan = (plan) => {
    navigate(`/admin/sampling-master/quality-plan/edit/${plan.id}`);
  };

  const handleDeleteSamplingPlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.samplePlanNo}"?`)) {
      return;
    }
    try {
      await deleteSamplingPlan(plan.id);
      await loadData();
    } catch (error) {
      alert('Failed to delete sampling plan: ' + error.message);
    }
  };

  const handleDeleteQualityPlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.qcPlanNo}"?`)) {
      return;
    }
    try {
      await deleteQualityPlan(plan.id);
      await loadData();
    } catch (error) {
      alert('Failed to delete quality plan: ' + error.message);
    }
  };

  const handleViewPlan = (plan) => {

    if (activeTab === 'sampling') {
      navigate(`/admin/sampling-master/sampling-plan/edit/${plan.id}`);
    } else {
      navigate(`/admin/sampling-master/quality-plan/edit/${plan.id}`);
    }
  };


  return (
    <div className="sm-page">
      <div className="sm-content">
        {}
        <div className="sm-page-header">
          <div className="sm-page-header-left">
            <div className="sm-page-icon">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="sm-page-title">Sampling Master</h1>
              <p className="sm-page-subtitle">
                Manage sampling plans and quality configurations
              </p>
            </div>
          </div>
          <div className="sm-page-header-right">
            {SAMPLING_API_CONFIG.useMockData && (
              <span style={{
                padding: '6px 12px',
                background: '#FEF3C7',
                color: '#D97706',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                marginRight: '12px',
              }}>
                Mock Mode
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <RefreshCw size={18} className={refreshing ? 'sm-spin' : ''} />
            </button>
          </div>
        </div>

        {}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatCard
            icon={Target}
            label="Sampling Plans"
            value={samplingPlans.length}
            color="#003366"
            trend="+2 this week"
          />
          <StatCard
            icon={ClipboardList}
            label="Quality Plans"
            value={qualityPlans.length}
            color="#059669"
          />
          <StatCard
            icon={Package}
            label="Products Covered"
            value={new Set(qualityPlans.map(p => p.productId)).size}
            color="#8B5CF6"
          />
          <StatCard
            icon={Building2}
            label="Departments"
            value={new Set(qualityPlans.map(p => p.departmentId)).size}
            color="#F59E0B"
          />
        </div>

        {}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          {}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '4px',
          }}>
            <button
              onClick={() => setActiveTab('sampling')}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'sampling' ? 'white' : 'transparent',
                boxShadow: activeTab === 'sampling' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'sampling' ? '#003366' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Target size={18} />
              Sampling Plans
              <span style={{
                padding: '2px 8px',
                background: activeTab === 'sampling' ? '#E6EEF5' : '#E2E8F0',
                color: activeTab === 'sampling' ? '#003366' : '#64748B',
                borderRadius: '10px',
                fontSize: '12px',
              }}>
                {samplingPlans.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'quality' ? 'white' : 'transparent',
                boxShadow: activeTab === 'quality' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'quality' ? '#059669' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <ClipboardList size={18} />
              Quality Plans
              <span style={{
                padding: '2px 8px',
                background: activeTab === 'quality' ? '#D1FAE5' : '#E2E8F0',
                color: activeTab === 'quality' ? '#059669' : '#64748B',
                borderRadius: '10px',
                fontSize: '12px',
              }}>
                {qualityPlans.length}
              </span>
            </button>
          </div>

          {}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
              }} />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '280px',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '8px',
                  border: '2px solid #E2E8F0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#003366'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            <button
              onClick={activeTab === 'sampling' ? handleCreateSamplingPlan : handleCreateQualityPlan}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'sampling' ? '#003366' : '#059669',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <Plus size={18} />
              {activeTab === 'sampling' ? 'New Sampling Plan' : 'New Quality Plan'}
            </button>
          </div>
        </div>

        {}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            color: '#64748B',
          }}>
            <Loader2 size={40} style={{ animation: 'sm-spin 1s linear infinite', marginBottom: '16px' }} />
            <span>Loading plans...</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {activeTab === 'sampling' ? (
              filteredSamplingPlans.length > 0 ? (
                filteredSamplingPlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    type="sampling"
                    onEdit={handleEditSamplingPlan}
                    onDelete={handleDeleteSamplingPlan}
                    onView={handleViewPlan}
                  />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#64748B',
                }}>
                  <Target size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#334155' }}>
                    No sampling plans found
                  </h3>
                  <p style={{ marginBottom: '24px' }}>
                    Create your first sampling plan to get started
                  </p>
                  <button
                    onClick={handleCreateSamplingPlan}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#003366',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Create Sampling Plan
                  </button>
                </div>
              )
            ) : (
              filteredQualityPlans.length > 0 ? (
                filteredQualityPlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    type="quality"
                    onEdit={handleEditQualityPlan}
                    onDelete={handleDeleteQualityPlan}
                    onView={handleViewPlan}
                  />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#64748B',
                }}>
                  <ClipboardList size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#334155' }}>
                    No quality plans found
                  </h3>
                  <p style={{ marginBottom: '24px' }}>
                    Create your first quality plan to get started
                  </p>
                  <button
                    onClick={handleCreateQualityPlan}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#059669',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Create Quality Plan
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplingMasterPage;
