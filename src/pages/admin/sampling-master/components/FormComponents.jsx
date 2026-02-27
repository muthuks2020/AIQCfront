import React, { useState, useRef, useCallback } from 'react';
import {
  ChevronDown,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
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
  min,
  max,
  step,
  onBlur,
  autoFocus = false,
  className = '',
}) => {
  const [focused, setFocused] = useState(false);

  const inputClass = [
    'sm-input',
    error && 'sm-error',
    success && 'sm-success',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="sm-field">
      {label && (
        <label className="sm-label" htmlFor={name}>
          {label}
          {required && <span className="sm-label-required">*</span>}
          {!required && <span className="sm-label-optional">(Optional)</span>}
        </label>
      )}
      <div className={Icon ? 'sm-input-wrapper' : ''}>
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
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          className={inputClass}
        />
        {Icon && <Icon size={18} className="sm-input-icon" />}
        {success && !error && (
          <Check size={18} className="sm-input-success-icon" />
        )}
      </div>
      {error && (
        <span className="sm-error-text">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
      {helper && !error && (
        <span className="sm-helper-text">{helper}</span>
      )}
      {success && !error && typeof success === 'string' && (
        <span className="sm-success-text">
          <Check size={12} />
          {success}
        </span>
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
  helper,
}) => {
  const selectClass = [
    'sm-select',
    error && 'sm-error',
  ].filter(Boolean).join(' ');

  return (
    <div className="sm-field">
      {label && (
        <label className="sm-label" htmlFor={name}>
          {label}
          {required && <span className="sm-label-required">*</span>}
          {!required && <span className="sm-label-optional">(Optional)</span>}
        </label>
      )}
      <div className="sm-select-wrapper">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          className={selectClass}
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 size={18} className="sm-select-icon" style={{ animation: 'sm-spin 1s linear infinite' }} />
        ) : (
          <ChevronDown size={18} className="sm-select-icon" />
        )}
      </div>
      {error && (
        <span className="sm-error-text">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
      {helper && !error && (
        <span className="sm-helper-text">{helper}</span>
      )}
    </div>
  );
};


export const FormSection = ({
  icon: Icon,
  title,
  badge,
  children,
  className = '',
}) => {
  return (
    <div className={`sm-section ${className}`}>
      <div className="sm-section-header">
        {Icon && (
          <div className="sm-section-icon">
            <Icon size={20} />
          </div>
        )}
        <h3 className="sm-section-title">{title}</h3>
        {badge && <span className="sm-section-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
};


export const PlanTypeSelector = ({
  value,
  onChange,
  options = [],
}) => {
  console.log('[PlanTypeSelector] Current value:', value, '| type:', typeof value);
  return (
    <div className="sm-plan-type-grid">
      {options.map(option => {
        const isSelected = String(value || '').toUpperCase() === String(option.value || '').toUpperCase();
        console.log(`[PlanTypeSelector] Comparing "${String(value || '').toUpperCase()}" === "${String(option.value || '').toUpperCase()}" → ${isSelected}`);
        return (
          <div
            key={option.value}
            className={`sm-plan-type-card ${isSelected ? 'sm-selected' : ''}`}
            onClick={() => onChange({ target: { name: 'samplePlanType', value: option.value } })}
          >
            <div className="sm-plan-type-icon">{option.icon}</div>
            <div className="sm-plan-type-name">{option.label}</div>
            <div className="sm-plan-type-desc">{option.description}</div>
            <div className="sm-plan-type-check">
              <Check size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
};


export const IterationSelector = ({
  value,
  onChange,
}) => {
  console.log('[IterationSelector] Current value:', value, '| type:', typeof value, '| Number():', Number(value));
  const iterations = [
    { value: 1, label: 'Single', desc: 'Normal sampling' },
    { value: 2, label: 'Double', desc: 'Re-inspection available' },
    { value: 3, label: 'Triple', desc: '100% final inspection' },
  ];

  return (
    <div className="sm-iteration-grid">
      {iterations.map(iter => {
        const isSelected = Number(value) === iter.value;
        return (
          <div
            key={iter.value}
            className={`sm-iteration-card ${isSelected ? 'sm-selected' : ''}`}
            onClick={() => onChange({ target: { name: 'iterations', value: iter.value } })}
          >
            <div className="sm-iteration-number">{iter.value}</div>
            <div className="sm-iteration-label">{iter.label}</div>
            <div className="sm-iteration-desc">{iter.desc}</div>
          </div>
        );
      })}
    </div>
  );
};


export const FormButton = ({
  children,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
}) => {
  const btnClass = [
    'sm-btn',
    `sm-btn-${variant}`,
    loading && 'sm-btn-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={btnClass}
      onClick={onClick}
      disabled={disabled || loading}
      style={fullWidth ? { width: '100%' } : {}}
    >
      {loading ? (
        <Loader2 size={18} className="sm-spin" />
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
    <div className="sm-success-overlay" onClick={onClose}>
      <div className="sm-success-modal" onClick={e => e.stopPropagation()}>
        <div className="sm-success-icon">
          <Check size={40} color="#10B981" />
        </div>
        <h2 className="sm-success-title">{title}</h2>
        <p className="sm-success-message">{message}</p>
        <div className="sm-success-actions">
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


export const Tooltip = ({ children, content }) => {
  return (
    <div className="sm-tooltip">
      {children}
      <div className="sm-tooltip-content">{content}</div>
    </div>
  );
};


export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="sm-loading">
      <div className="sm-spinner" />
      <span>{message}</span>
    </div>
  );
};


export const DepartmentInfo = ({ department }) => {
  if (!department) return null;

  return (
    <div className="sm-dept-info">
      <div className="sm-dept-info-item">
        <div className="sm-dept-info-icon sm-pass">
          <Check size={20} />
        </div>
        <div className="sm-dept-info-content">
          <div className="sm-dept-info-label">QC Pass Location</div>
          <div className="sm-dept-info-value">{department.passSourceLocation}</div>
          <div className="sm-dept-info-id">{department.passSourceLocationOdooId}</div>
        </div>
      </div>
      <div className="sm-dept-info-item">
        <div className="sm-dept-info-icon sm-pass">
          <Check size={20} />
        </div>
        <div className="sm-dept-info-content">
          <div className="sm-dept-info-label">Pass Destination</div>
          <div className="sm-dept-info-value">{department.passDestLocation}</div>
          <div className="sm-dept-info-id">{department.passDestLocationOdooId}</div>
        </div>
      </div>
      <div className="sm-dept-info-item">
        <div className="sm-dept-info-icon sm-fail">
          <AlertCircle size={20} />
        </div>
        <div className="sm-dept-info-content">
          <div className="sm-dept-info-label">QC Fail Location</div>
          <div className="sm-dept-info-value">{department.failSourceLocation}</div>
          <div className="sm-dept-info-id">{department.failSourceLocationOdooId}</div>
        </div>
      </div>
      <div className="sm-dept-info-item">
        <div className="sm-dept-info-icon sm-fail">
          <AlertCircle size={20} />
        </div>
        <div className="sm-dept-info-content">
          <div className="sm-dept-info-label">Fail Destination</div>
          <div className="sm-dept-info-value">{department.failDestLocation}</div>
          <div className="sm-dept-info-id">{department.failDestLocationOdooId}</div>
        </div>
      </div>
    </div>
  );
};

export default {
  FormInput,
  FormSelect,
  FormSection,
  PlanTypeSelector,
  IterationSelector,
  FormButton,
  SuccessModal,
  Tooltip,
  LoadingSpinner,
  DepartmentInfo,
};
