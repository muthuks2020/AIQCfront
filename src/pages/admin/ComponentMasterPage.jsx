import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Upload,
  Download,
  HelpCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  Package,
} from 'lucide-react';
import ComponentDetailModal from './component-master/components/ComponentDetailModal';
import {
  fetchComponents,
  deleteComponent,
  duplicateComponent,
  exportComponents,
  importComponents,
} from './component-master/api/componentMasterApi';
import './component-master/styles/ComponentMasterPage.css';


const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'critical_assembly', label: 'Critical Assembly' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'optical', label: 'Optical' },
  { id: 'plastic', label: 'Plastic' },
];


const ComponentCard = ({ component, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'cmp-status-active';
      case 'draft': return 'cmp-status-draft';
      case 'inactive': return 'cmp-status-inactive';
      default: return 'cmp-status-draft';
    }
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="cmp-card" onClick={() => onClick(component)}>
      {}
      <div className="cmp-card-header">
        <div className="cmp-card-badges">
          <span className={`cmp-badge ${getStatusColor(component.status)}`}>
            {component.status || 'Active'}
          </span>
          <span className="cmp-badge cmp-badge-category">
            {getCategoryLabel(component.productCategory)}
          </span>
        </div>
        <span className="cmp-card-code">{component.partCode}</span>
      </div>

      {}
      <h3 className="cmp-card-title">{component.partName}</h3>

      {}
      <div className="cmp-card-info">
        <div className="cmp-card-info-row">
          <span className="cmp-card-label">Vendor:</span>
          <span className="cmp-card-value">{component.vendor || 'Not assigned'}</span>
        </div>
        <div className="cmp-card-info-row">
          <span className="cmp-card-label">QC Plan:</span>
          <span className="cmp-card-value">{component.qcPlanNo || component.samplingPlan || 'N/A'}</span>
        </div>
        <div className="cmp-card-info-row">
          <span className="cmp-card-label">Checkpoints:</span>
          <span className="cmp-card-value">{component.checkpoints || component.checkingParameters?.parameters?.length || 0}</span>
        </div>
      </div>

      {}
      {component.specifications && Object.keys(component.specifications).length > 0 && (
        <div className="cmp-card-specs">
          {Object.entries(component.specifications).slice(0, 2).map(([key, value]) => (
            <div key={key} className="cmp-card-spec-row">
              <span className="cmp-card-spec-label">{key}:</span>
              <span className="cmp-card-spec-value">{value}</span>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="cmp-card-footer">
        {component.lastInspected ? (
          <span className="cmp-card-inspected">
            Last inspected: {formatDate(component.lastInspected)}
          </span>
        ) : (
          <span className="cmp-card-not-inspected">Not yet inspected</span>
        )}
      </div>
    </div>
  );
};


const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="cmp-pagination">
      <div className="cmp-pagination-info">
        Showing {startItem}-{endItem} of {totalItems} components
      </div>

      <div className="cmp-pagination-controls">
        <button
          className="cmp-pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`cmp-pagination-btn ${page === currentPage ? 'cmp-pagination-active' : ''} ${page === '...' ? 'cmp-pagination-ellipsis' : ''}`}
            onClick={() => page !== '...' && onPageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          className="cmp-pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="cmp-pagination-size">
        <span>Show:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="cmp-pagination-select"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
          <option value={96}>96</option>
        </select>
      </div>
    </div>
  );
};


const ComponentMasterPage = () => {
  const navigate = useNavigate();


  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);


  const loadComponents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };

      const response = await fetchComponents(params);

      setComponents(response.items || response.data || []);
      setTotalItems(response.pagination?.total || response.total || response.items?.length || 0);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err.message || 'Failed to load components');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedCategory]);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleCardClick = (component) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComponent(null);
  };

  const handleEditComponent = (component) => {
    navigate(`/admin/component-master/edit/${component.id}`);
  };

  const handleDuplicateComponent = async (component) => {
    setActionLoading(true);
    try {
      const duplicated = await duplicateComponent(component.id);
      setIsModalOpen(false);
      setSelectedComponent(null);

      await loadComponents();

      navigate(`/admin/component-master/edit/${duplicated.id}`);
    } catch (err) {
      console.error('Error duplicating component:', err);
      alert('Failed to duplicate component: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComponent = async (component) => {
    if (!window.confirm(`Are you sure you want to delete "${component.partName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteComponent(component.id);
      setIsModalOpen(false);
      setSelectedComponent(null);

      await loadComponents();
    } catch (err) {
      console.error('Error deleting component:', err);
      alert('Failed to delete component: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setImportLoading(true);
      try {
        await importComponents(file);
        await loadComponents();
        alert('Components imported successfully!');
      } catch (err) {
        console.error('Error importing components:', err);
        alert('Failed to import components: ' + err.message);
      } finally {
        setImportLoading(false);
      }
    };
    input.click();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };
      await exportComponents(params);
    } catch (err) {
      console.error('Error exporting components:', err);
      alert('Failed to export components: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAddComponent = () => {
    navigate('/admin/component-master/new');
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="cmp-page">
      {}
      <div className="cmp-header">
        <div className="cmp-header-left">
          <h1 className="cmp-title">Component Master</h1>
          <p className="cmp-subtitle">Manage component specifications and QC requirements</p>
        </div>
        <div className="cmp-header-right">
          <button
            className="cmp-btn cmp-btn-outline"
            onClick={handleImport}
            disabled={importLoading}
          >
            {importLoading ? <Loader2 size={18} className="cmp-spin" /> : <Upload size={18} />}
            Import
          </button>
          <button
            className="cmp-btn cmp-btn-outline"
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? <Loader2 size={18} className="cmp-spin" /> : <Download size={18} />}
            Export
          </button>
          <button className="cmp-btn cmp-btn-primary" onClick={handleAddComponent}>
            <Plus size={18} />
            Add Component
          </button>
          <button className="cmp-btn cmp-btn-icon" title="Help">
            <HelpCircle size={20} />
          </button>
          <button className="cmp-btn cmp-btn-icon" title="Notifications">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {}
      <div className="cmp-filters-container">
        <div className="cmp-search-box">
          <Search size={20} className="cmp-search-icon" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={handleSearch}
            className="cmp-search-input"
          />
        </div>

        <div className="cmp-category-tabs">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`cmp-category-tab ${selectedCategory === category.id ? 'cmp-category-active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="cmp-content">
        {loading ? (
          <div className="cmp-loading">
            <Loader2 size={48} className="cmp-spin" />
            <p>Loading components...</p>
          </div>
        ) : error ? (
          <div className="cmp-error">
            <AlertCircle size={48} />
            <p>{error}</p>
            <button className="cmp-btn cmp-btn-primary" onClick={loadComponents}>
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        ) : components.length === 0 ? (
          <div className="cmp-empty">
            <Package size={64} />
            <h3>No components found</h3>
            <p>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first component'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button className="cmp-btn cmp-btn-primary" onClick={handleAddComponent}>
                <Plus size={18} />
                Add Component
              </button>
            )}
          </div>
        ) : (
          <>
            {}
            <div className="cmp-cards-grid">
              {components.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onClick={handleCardClick}
                />
              ))}
            </div>

            {}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      {}
      {isModalOpen && selectedComponent && (
        <ComponentDetailModal
          component={selectedComponent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditComponent}
          onDuplicate={handleDuplicateComponent}
          onDelete={handleDeleteComponent}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ComponentMasterPage;
