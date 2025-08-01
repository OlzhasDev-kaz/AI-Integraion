import React from 'react';

export const ProgressBar = ({ 
  progress, 
  className = '', 
  showPercentage = true,
  size = 'md',
  variant = 'primary' 
}) => {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const variants = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };
  
  return (
    <div className={className}>
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <div 
          className={`${variants[variant]} ${sizes[size]} rounded-full transition-all duration-300 progress-bar`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-600 mt-1 block">{progress}%</span>
      )}
    </div>
  );
};