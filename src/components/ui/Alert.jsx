import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

const Alert = ({ 
  children, 
  variant = 'info', 
  dismissible = false, 
  onDismiss,
  className,
  ...props 
}) => {
  const variants = {
    success: {
      container: 'bg-success-50 border-success-200 text-success-800',
      icon: CheckCircle,
      iconColor: 'text-success-600',
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-800',
      icon: AlertCircle,
      iconColor: 'text-error-600',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: AlertTriangle,
      iconColor: 'text-warning-600',
    },
    info: {
      container: 'bg-primary-50 border-primary-200 text-primary-800',
      icon: Info,
      iconColor: 'text-primary-600',
    },
  };
  
  const { container, icon: Icon, iconColor } = variants[variant];
  
  const classes = clsx(
    'flex items-start p-4 border rounded-lg',
    container,
    className
  );
  
  return (
    <div className={classes} role="alert" {...props}>
      <Icon className={clsx('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', iconColor)} />
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={clsx(
            'ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2',
            variant === 'success' && 'focus:ring-success-500',
            variant === 'error' && 'focus:ring-error-500',
            variant === 'warning' && 'focus:ring-warning-500',
            variant === 'info' && 'focus:ring-primary-500'
          )}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

