import React, { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  'aria-label': ariaLabel,
  className = '',
  type = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    link: 'text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} aria-hidden="true" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`h-4 w-4 ${children ? 'ml-2' : ''}`} aria-hidden="true" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };