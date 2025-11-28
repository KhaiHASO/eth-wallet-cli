import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  action?: ReactNode;
  children: ReactNode;
}

const Field = ({ label, htmlFor, error, helper, action, children }: FieldProps) => (
  <div className="field">
    <div className="field-head">
      <label htmlFor={htmlFor}>{label}</label>
      {action && <div className="field-action">{action}</div>}
    </div>
    {children}
    {helper && !error && <small className="field-helper">{helper}</small>}
    {error && <small className="field-error">{error}</small>}
  </div>
);

export default Field;

