import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Upload,
  Eye,
  Package,
  Settings,
  Copy
} from 'lucide-react';
import { Header, Card, Button, Badge } from '../../components/common';
import { colors, borderRadius } from '../../constants/theme';


const mockComponents = [
  {
    id: 'BSC-001',
    name: 'Ultrasound Transducer Head',
    category: 'Critical Assembly',
    productLine: 'B-SCAN',
    vendor: 'Precision Components Ltd',
    qcPlan: 'SP-001',
    checkpoints: 12,
    specifications: {
      material: 'Piezoelectric Crystal',
      dimension: '25mm x 15mm x 8mm',
      tolerance: '±0.1mm',
    },
    status: 'active',
    lastInspected: '2026-01-30',
  },
  {
    id: 'BSC-002',
    name: 'Probe Cable Assembly',
    category: 'Electrical',
    productLine: 'B-SCAN',
    vendor: 'ElectroCables India',
    qcPlan: 'SP-002',
    checkpoints: 8,
    specifications: {
      material: 'Copper with PVC Sheath',
      length: '2.5m',
      tolerance: '±50mm',
    },
    status: 'active',
    lastInspected: '2026-01-29',
  },
  {
    id: 'BSC-003',
    name: 'Display Panel Module',
    category: 'Electronics',
    productLine: 'B-SCAN',
    vendor: 'TechDisplay Corp',
    qcPlan: 'SP-002',
    checkpoints: 15,
    specifications: {
      type: 'LCD 7-inch',
      resolution: '1024x768',
      brightness: '350 nits',
    },
    status: 'active',
    lastInspected: '2026-01-28',
  },
  {
    id: 'BSC-004',
    name: 'Outer Casing - Top',
    category: 'Mechanical',
    productLine: 'B-SCAN',
    vendor: 'Plastics Pro Ltd',
    qcPlan: 'SP-003',
    checkpoints: 6,
    specifications: {
      material: 'ABS Plastic',
      color: 'Medical White',
      finish: 'Matte',
    },
    status: 'draft',
    lastInspected: null,
  },
  {
    id: 'BSC-005',
    name: 'Power Supply Unit',
    category: 'Electrical',
    productLine: 'B-SCAN',
    vendor: 'PowerTech Systems',
    qcPlan: 'SP-001',
    checkpoints: 10,
    specifications: {
      input: '100-240V AC',
      output: '12V DC, 5A',
      certification: 'CE, UL',
    },
    status: 'active',
    lastInspected: '2026-01-27',
  },
];

const ComponentMasterPage = () => {
  const [components, setComponents] = useState(mockComponents);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState(null);

  const categories = ['all', ...new Set(mockComponents.map(c => c.category))];

  const filteredComponents = components.filter(comp => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || comp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.page}>
      <Header
        title="Component Master"
        subtitle="Manage component specifications and QC requirements"
        actions={
          <div style={styles.headerActions}>
            <Button variant="outline" icon={Upload} size="sm">
              Import
            </Button>
            <Button variant="outline" icon={Download} size="sm">
              Export
            </Button>
            <Button icon={Plus}>
              Add Component
            </Button>
          </div>
        }
      />

      <div style={styles.content}>
        {/* Search and Filter Bar */}
        <Card padding="16px">
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.categoryFilters}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  style={{
                    ...styles.categoryButton,
                    background: categoryFilter === category ? colors.primary : 'transparent',
                    color: categoryFilter === category ? 'white' : colors.neutral[600],
                    borderColor: categoryFilter === category ? colors.primary : colors.neutral[200],
                  }}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {}
        <div style={styles.componentsGrid}>
          {filteredComponents.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onView={() => setSelectedComponent(component)}
            />
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <Card>
            <div style={styles.emptyState}>
              <Package size={48} color={colors.neutral[300]} />
              <h3>No Components Found</h3>
              <p>No components match your search criteria.</p>
            </div>
          </Card>
        )}
      </div>

      {}
      {selectedComponent && (
        <ComponentDetailModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
};


const ComponentCard = ({ component, onView }) => (
  <Card hover onClick={onView} style={styles.componentCard}>
    <div style={styles.cardHeader}>
      <div style={styles.cardBadges}>
        <Badge type="status" value={component.status} size="sm" />
        <span style={styles.categoryTag}>{component.category}</span>
      </div>
      <span style={styles.componentId}>{component.id}</span>
    </div>

    <h3 style={styles.componentName}>{component.name}</h3>

    <div style={styles.componentMeta}>
      <div style={styles.metaItem}>
        <strong>Vendor:</strong> {component.vendor}
      </div>
      <div style={styles.metaItem}>
        <strong>QC Plan:</strong> {component.qcPlan}
      </div>
      <div style={styles.metaItem}>
        <strong>Checkpoints:</strong> {component.checkpoints}
      </div>
    </div>

    <div style={styles.specPreview}>
      {Object.entries(component.specifications).slice(0, 2).map(([key, value]) => (
        <div key={key} style={styles.specItem}>
          <span style={styles.specKey}>{key}:</span>
          <span style={styles.specValue}>{value}</span>
        </div>
      ))}
    </div>

    <div style={styles.cardFooter}>
      {component.lastInspected ? (
        <span style={styles.lastInspected}>
          Last inspected: {formatDate(component.lastInspected)}
        </span>
      ) : (
        <span style={styles.neverInspected}>Not yet inspected</span>
      )}
    </div>
  </Card>
);


const ComponentDetailModal = ({ component, onClose }) => (
  <div style={styles.modalBackdrop} onClick={onClose}>
    <div style={styles.modal} onClick={e => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <div>
          <h2 style={styles.modalTitle}>{component.name}</h2>
          <span style={styles.modalId}>{component.id}</span>
        </div>
        <button style={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div style={styles.modalBody}>
        {}
        <section style={styles.modalSection}>
          <h3 style={styles.sectionTitle}>General Information</h3>
          <div style={styles.infoGrid}>
            <InfoItem label="Category" value={component.category} />
            <InfoItem label="Product Line" value={component.productLine} />
            <InfoItem label="Vendor" value={component.vendor} />
            <InfoItem label="QC Plan" value={component.qcPlan} />
            <InfoItem label="Checkpoints" value={component.checkpoints} />
            <InfoItem label="Status" value={<Badge type="status" value={component.status} size="sm" />} />
          </div>
        </section>

        {}
        <section style={styles.modalSection}>
          <h3 style={styles.sectionTitle}>Specifications</h3>
          <div style={styles.specsList}>
            {Object.entries(component.specifications).map(([key, value]) => (
              <div key={key} style={styles.specRow}>
                <span style={styles.specLabel}>{key}</span>
                <span style={styles.specVal}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={styles.modalFooter}>
        <Button variant="outline" icon={Copy}>
          Duplicate
        </Button>
        <div style={styles.footerRight}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Edit2}>
            Edit Component
          </Button>
        </div>
      </div>
    </div>
  </div>
);


const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);


const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

  headerActions: {
    display: 'flex',
    gap: '8px',
  },

  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.neutral[200]}`,
  },

  searchIcon: {
    color: colors.neutral[400],
  },

  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    color: colors.neutral[700],
  },

  categoryFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  categoryButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: borderRadius.md,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },

  componentCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  categoryTag: {
    fontSize: '11px',
    fontWeight: 500,
    color: colors.neutral[500],
    padding: '2px 8px',
    background: colors.neutral[100],
    borderRadius: borderRadius.full,
  },

  componentId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: colors.primary,
    fontWeight: 500,
  },

  componentName: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: 0,
  },

  componentMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: colors.neutral[600],
  },

  metaItem: {},

  specPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    background: colors.neutral[50],
    borderRadius: borderRadius.md,
  },

  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },

  specKey: {
    color: colors.neutral[500],
    textTransform: 'capitalize',
  },

  specValue: {
    color: colors.neutral[700],
    fontWeight: 500,
  },

  cardFooter: {
    paddingTop: '12px',
    borderTop: `1px solid ${colors.neutral[100]}`,
  },

  lastInspected: {
    fontSize: '11px',
    color: colors.neutral[500],
  },

  neverInspected: {
    fontSize: '11px',
    color: colors.warning,
    fontStyle: 'italic',
  },

  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: colors.neutral[500],
  },


  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },

  modal: {
    background: 'white',
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },

  modalTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: colors.neutral[800],
    margin: 0,
  },

  modalId: {
    fontSize: '13px',
    color: colors.primary,
    fontFamily: 'monospace',
  },

  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: borderRadius.md,
    border: 'none',
    background: colors.neutral[100],
    fontSize: '20px',
    color: colors.neutral[500],
    cursor: 'pointer',
  },

  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },

  modalSection: {
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.neutral[800],
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  infoLabel: {
    fontSize: '12px',
    color: colors.neutral[500],
  },

  infoValue: {
    fontSize: '14px',
    color: colors.neutral[800],
    fontWeight: 500,
  },

  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: colors.neutral[50],
    borderRadius: borderRadius.md,
  },

  specLabel: {
    fontSize: '13px',
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },

  specVal: {
    fontSize: '13px',
    color: colors.neutral[800],
    fontWeight: 500,
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: `1px solid ${colors.neutral[100]}`,
    background: colors.neutral[50],
  },

  footerRight: {
    display: 'flex',
    gap: '8px',
  },
};

export default ComponentMasterPage;
