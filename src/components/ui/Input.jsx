import React from 'react';
import { clsx } from 'clsx';

const Input = React.forwardRef(({ 
  label,
  error,
  help,
  className,
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = clsx(
    'form-input',
    error && 'form-input-error',
    className
  );
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : help ? `${inputId}-help` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {help && !error && (
        <p id={`${inputId}-help`} className="form-help">
          {help}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

