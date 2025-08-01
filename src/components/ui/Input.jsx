import React, { forwardRef, useState, useId } from 'react';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';

export const Input = forwardRef(({ 
  label, 
  error, 
  help,
  required = false,
  type = 'text',
  className = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  
  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : help ? helpId : undefined}
          className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {help && !error && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">{help}</p>
      )}
    </div>
  );
});