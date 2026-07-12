import React from 'react';
import './common.css';

export const Badge = ({ children, color = 'gray' }) => (
  <span className={`badge badge-${color}`}>{children}</span>
);

export const Card = ({ children, className = '', style, noPad }) => (
  <div className={`card ${className}`} style={{ ...(noPad ? { padding: 0 } : {}), ...style }}>{children}</div>
);

export const Btn = ({ children, variant = 'ghost', size = '', onClick, type = 'button', disabled, className = '', title }) => (
  <button type={type} className={`btn btn-${variant}${size ? ' btn-'+size : ''} ${className}`} onClick={onClick} disabled={disabled} title={title}>
    {children}
  </button>
);

export const Table = ({ headers, children, loading, emptyText = 'Sin datos' }) => (
  <div className="table-wrap">
    <table>
      <thead><tr>{headers.map((h,i) => <th key={i}>{h}</th>)}</tr></thead>
      <tbody>
        {loading
          ? <tr><td colSpan={headers.length} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}><span className="spinner" /> Cargando...</td></tr>
          : children}
      </tbody>
    </table>
  </div>
);

export const Modal = ({ open, title, onClose, onSave, children, size = '', saveLabel = 'Guardar', saveDisabled }) => (
  <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose?.()}>
    <div className={`modal${size ? ' '+size : ''}`}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button className="icon-btn" onClick={onClose}><i className="fa-solid fa-x" /></button>
      </div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <Btn onClick={onClose}>Cancelar</Btn>
        {onSave && <Btn variant="primary" onClick={onSave} disabled={saveDisabled}><i className="fa-solid fa-save" /> {saveLabel}</Btn>}
      </div>
    </div>
  </div>
);

export const FormGroup = ({ label, children, required }) => (
  <div className="form-group">
    <label className="form-label">{label}{required && <span style={{color:'var(--red)'}}>*</span>}</label>
    {children}
  </div>
);

export const Input = (props) => <input className="form-input" {...props} />;
export const Select = ({ children, ...props }) => <select className="form-input form-select" {...props}>{children}</select>;
export const Textarea = (props) => <textarea className="form-input" rows={3} {...props} />;
export const FormRow = ({ children }) => <div className="form-row">{children}</div>;

export const PageHeader = ({ title, children }) => (
  <div className="page-header">
    <h1 className="page-title">{title}</h1>
    {children && <div className="page-header-actions">{children}</div>}
  </div>
);

export const KpiCard = ({ icon, value, label, color = 'blue', trend, sub, progress }) => (
  <Card>
    <div className={`kpi-icon kpi-${color}`}><i className={`fa-solid ${icon}`} /></div>
    <div className="kpi-value">{value}</div>
    <div className="card-label">{label}</div>
    {trend && <div style={{marginTop:'6px'}}><span className={`trend trend-${trend.up ? 'up':'down'}`}><i className={`fa-solid fa-arrow-${trend.up?'up':'down'}`} /> {trend.text}</span></div>}
    {sub && <div className="card-sub" style={{marginTop:'4px'}}>{sub}</div>}
    {progress !== undefined && <div className="progress-bar"><div className="progress-fill" style={{width:progress+'%',background:`var(--${color==='green'?'green':color==='red'?'red':color==='amber'?'amber':'accent'})`}} /></div>}
  </Card>
);

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="tab-row">
    {tabs.map(t => <button key={t.key} className={`tab${active===t.key?' active':''}`} onClick={() => onChange(t.key)}>{t.label}</button>)}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="search-bar">
    <i className="fa-solid fa-magnifying-glass" style={{color:'var(--text3)'}} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export const EmptyState = ({ icon = 'fa-inbox', text = 'Sin resultados' }) => (
  <div className="empty-state"><i className={`fa-solid ${icon}`} />{text}</div>
);

export const Toast = ({ toasts, removeToast }) => (
  <div className="toast-wrap">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
        <i className={`fa-solid ${t.type==='success'?'fa-check-circle':t.type==='error'?'fa-circle-exclamation':t.type==='warning'?'fa-triangle-exclamation':'fa-circle-info'}`} style={{flexShrink:0}} />
        {t.message}
      </div>
    ))}
  </div>
);
