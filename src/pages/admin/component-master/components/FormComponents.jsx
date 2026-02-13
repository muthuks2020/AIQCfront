import React, { useState, useRef, useCallback } from 'react';
import {
  ChevronDown,
  Upload,
  X,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  HelpCircle
} from 'lucide-react';


export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  helper,
  icon: Icon,
  maxLength,
  onBlur,
  autoFocus = false,
}) => {
  const [focused, setFocused] = useState(false);

  const inputClass = [
    'cm-input',
    error && 'cm-error',
    success && 'cm-success',
  ].filter(Boolean).join(' ');

  return (
    <div className="cm-field">
      {label && (
        <label className="cm-label" htmlFor={name}>
          {label}
          {required && <span className="cm-label-required">*</span>}
          {!required && <span className="cm-label-optional">(Optional)</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={inputClass}
          style={Icon ? { paddingLeft: '44px' } : {}}
        />
        {Icon && (
          <Icon
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? '#003366' : '#94A3B8',
              transition: 'color 0.3s ease',
            }}
          />
        )}
        {success && (
          <Check
            size={18}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10B981',
            }}
          />
        )}
      </div>
      {error && (
        <span className="cm-error-text">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
      {helper && !error && (
        <span className="cm-helper-text">{helper}</span>
      )}
    </div>
  );
};


export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  loading = false,
}) => {
  const selectClass = [
    'cm-select',
    error && 'cm-error',
  ].filter(Boolean).join(' ');

  return (
    <div className="cm-field">
      {label && (
        <label className="cm-label" htmlFor={name}>
          {label}
          {required && <span className="cm-label-required">*</span>}
          {!required && <span className="cm-label-optional">(Optional)</span>}
        </label>
      )}
      <div className="cm-select-wrapper">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          className={selectClass}
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {options.map((option) => (
            <option key={option.value || option.id} value={option.value || option.id}>
              {option.label || option.name}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="cm-select-icon" />
      </div>
      {error && (
        <span className="cm-error-text">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
};


export const FormToggle = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => {
  return (
    <div className="cm-field">
      {label && (
        <label className="cm-label">
          {label}
          {required && <span className="cm-label-required">*</span>}
        </label>
      )}
      <div className="cm-toggle-group">
        {options.map((option) => (
          <div
            key={option.value}
            className={`cm-toggle-item ${value === option.value ? 'cm-toggle-active' : ''}`}
            onClick={() => onChange({ target: { name, value: option.value } })}
          >
            <div className="cm-toggle-radio">
              <div className="cm-toggle-radio-inner" />
            </div>
            <div>
              <span className="cm-toggle-label">{option.label}</span>
              {option.description && (
                <span style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  {option.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const FormCheckboxCard = ({
  label,
  name,
  checked,
  onChange,
  description,
  icon: Icon,
}) => {
  return (
    <div
      className={`cm-checkbox-card ${checked ? 'cm-checkbox-checked' : ''}`}
      onClick={() => onChange({ target: { name, checked: !checked, type: 'checkbox' } })}
    >
      <div className="cm-checkbox-box">
        <Check size={14} className="cm-checkbox-icon" />
      </div>
      {Icon && (
        <Icon size={20} style={{ color: checked ? '#10B981' : '#94A3B8' }} />
      )}
      <div className="cm-checkbox-content">
        <span className="cm-checkbox-label">{label}</span>
        {description && (
          <span className="cm-checkbox-description">{description}</span>
        )}
      </div>
    </div>
  );
};


export const FormFileUpload = ({
  label,
  name,
  value,
  onChange,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSize = 5,
  required = false,
  error,
  description,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  const validateAndSetFile = (file) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      onChange({ target: { name, value: null, error: `File size must be less than ${maxSize}MB. Your file is ${sizeMB.toFixed(2)}MB` } });
      return;
    }


    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      onChange({ target: { name, value: null, error: `Invalid file type. Allowed: ${accept}` } });
      return;
    }

    onChange({ target: { name, value: file, error: null } });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemove = () => {
    onChange({ target: { name, value: null, error: null } });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isImage = value?.type?.startsWith('image/');
  const isPdf = value?.type === 'application/pdf';

  return (
    <div className="cm-field">
      {label && (
        <label className="cm-label">
          {label}
          {required && <span className="cm-label-required">*</span>}
          {!required && <span className="cm-label-optional">(Optional)</span>}
        </label>
      )}
      {description && (
        <span className="cm-helper-text" style={{ marginBottom: '8px', display: 'block' }}>{description}</span>
      )}
      <div
        className={`cm-file-upload ${isDragging ? 'cm-file-dragging' : ''} ${value ? 'cm-file-has-file' : ''} ${error ? 'cm-file-error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="cm-file-upload-input"
        />
        {!value ? (
          <>
            <div className="cm-file-upload-icon">
              <Upload size={24} />
            </div>
            <p className="cm-file-upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="cm-file-upload-hint">
              PDF, PNG, or JPG (max. {maxSize}MB)
            </p>
          </>
        ) : (
          <div className="cm-file-preview">
            <div className="cm-file-preview-icon">
              {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div className="cm-file-preview-info">
              <span className="cm-file-preview-name">{value.name}</span>
              <span className="cm-file-preview-size">{formatFileSize(value.size)}</span>
            </div>
            <button
              type="button"
              className="cm-file-preview-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {error && (
        <span className="cm-error-text">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
};


export const CategorySelector = ({
  categories = [],
  value,
  onChange,
  error,
  required = false,
}) => {
  const categoryIcons = {
    mechanical: '⚙️',
    electrical: '⚡',
    plastic: '🧪',
    electronics: '🔌',
    optical: '🔍',
  };

  return (
    <div className="cm-field cm-field-full">
      <label className="cm-label">
        Product Category
        {required && <span className="cm-label-required">*</span>}
      </label>
      <div className="cm-category-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`cm-category-card ${value === category.id ? 'cm-category-selected' : ''}`}
            onClick={() => onChange({ target: { name: 'productCategory', value: category.id } })}
          >
            <div className="cm-category-check">
              <Check size={14} />
            </div>
            <div className="cm-category-icon">
              {categoryIcons[category.id] || '📦'}
            </div>
            <span className="cm-category-name">{category.name}</span>
          </div>
        ))}
      </div>
      {error && (
        <span className="cm-error-text" style={{ marginTop: '12px' }}>
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
};


export const Tooltip = ({ children, content }) => (
  <span className="cm-tooltip">
    {children}
    <span className="cm-tooltip-content">{content}</span>
  </span>
);


export const FormSection = ({
  icon: Icon,
  title,
  badge,
  children
}) => (
  <div className="cm-section">
    <div className="cm-section-header">
      {Icon && (
        <div className="cm-section-icon">
          <Icon size={18} />
        </div>
      )}
      <h3 className="cm-section-title">{title}</h3>
      {badge && <span className="cm-section-badge">{badge}</span>}
    </div>
    {children}
  </div>
);


export const FormButton = ({
  children,
  variant = 'primary',
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  fullWidth = false,
}) => {
  const className = [
    'cm-btn',
    `cm-btn-${variant}`,
    loading && 'cm-btn-loading',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      style={fullWidth ? { width: '100%' } : {}}
    >
      {loading ? (
        <>Loading...</>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={18} />}
        </>
      )}
    </button>
  );
};


export const SuccessModal = ({
  show,
  title = 'Success!',
  message = 'Operation completed successfully.',
  onClose,
  onAction,
  actionLabel = 'Create Another',
}) => {
  if (!show) return null;

  return (
    <div className="cm-success-overlay" onClick={onClose}>
      <div className="cm-success-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-success-icon">
          <Check size={40} color="#10B981" />
        </div>
        <h2 className="cm-success-title">{title}</h2>
        <p className="cm-success-message">{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <FormButton variant="outline" onClick={onClose}>
            Close
          </FormButton>
          {onAction && (
            <FormButton variant="success" onClick={onAction}>
              {actionLabel}
            </FormButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  FormInput,
  FormSelect,
  FormToggle,
  FormCheckboxCard,
  FormFileUpload,
  CategorySelector,
  FormSection,
  FormButton,
  SuccessModal,
  Tooltip,
};
