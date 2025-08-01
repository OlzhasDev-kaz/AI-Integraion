import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  return (
    <div 
      className={`${sizes[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Загрузка"
    />
  );
};