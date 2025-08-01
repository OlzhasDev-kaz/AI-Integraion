import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, send to Sentry, LogRocket, etc.
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous'
      };

      // Example: send to monitoring service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      console.log('Error report:', errorReport);
    } catch (reportingError) {
      console.error('Failed to log error:', reportingError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Что-то пошло не так
                </h1>
                <p className="text-gray-600 mt-1">
                  Произошла неождиданная ошибка в приложении
                </p>
              </div>
            </div>

            {/* Error message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Детали ошибки:
              </h3>
              <p className="text-sm text-red-700 font-mono">
                {this.state.error?.message || 'Неизвестная ошибка'}
              </p>
              {this.state.errorId && (
                <p className="text-xs text-red-600 mt-2">
                  ID ошибки: {this.state.errorId}
                </p>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Что можно попробовать:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Перезагрузить страницу</li>
                <li>• Очистить кэш браузера</li>
                <li>• Проверить подключение к интернету</li>
                <li>• Попробовать позже</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Перезагрузить страницу
              </button>
              
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Попробовать снова
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                На главную
              </button>
            </div>

            {/* Development details */}
            {isDevelopment && this.state.error && (
              <details className="mt-6 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Детали для разработчика
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Error Stack:</h4>
                    <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Component Stack:</h4>
                      <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Contact support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Если проблема повторяется, пожалуйста, сообщите нам:
              </p>
              <div className="mt-2 flex space-x-4 text-sm">
                <a
                  href="mailto:support@ai-business-planner.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  support@ai-business-planner.com
                </a>
                <span className="text-gray-400">|</span>
                <a
                  href="https://github.com/your-repo/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  GitHub Issues
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping individual components
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting from functional components
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    // Create a synthetic error boundary error
    console.error('Manual error report:', error, errorInfo);
    
    // In a real app, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      try {
        const errorReport = {
          message: error.message || String(error),
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          ...errorInfo
        };
        
        // Send to monitoring service
        console.log('Error report from hook:', errorReport);
      } catch (reportingError) {
        console.error('Failed to log error:', reportingError);
      }
    }
  };

  return { handleError };
};