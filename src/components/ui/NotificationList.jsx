import React from 'react';
import { X, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const NotificationList = () => {
  const { notifications, removeNotification } = useAppContext();
  
  if (notifications.length === 0) return null;
  
  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertTriangle,
    info: AlertCircle
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => {
        const Icon = icons[notification.type];
        
        return (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg shadow-lg border-l-4 bg-white animate-slide-up ${
              notification.type === 'success' ? 'border-green-400' :
              notification.type === 'warning' ? 'border-yellow-400' :
              notification.type === 'error' ? 'border-red-400' :
              'border-blue-400'
            }`}
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-2">
                <Icon className={`h-5 w-5 mt-0.5 ${
                  notification.type === 'success' ? 'text-green-600' :
                  notification.type === 'warning' ? 'text-yellow-600' :
                  notification.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex space-x-2 mt-2">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.action();
                            if (!notification.persistent) {
                              removeNotification(notification.id);
                            }
                          }}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="Закрыть уведомление"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};