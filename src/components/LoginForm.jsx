import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useValidation } from '../hooks/useValidation';
import { validators } from '../utils/validators';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const LoginForm = () => {
  const { setIsAuthenticated, addNotification, handleError } = useAppContext();
  const [formData, setFormData] = useState({ 
    email: 'demo@example.com', 
    password: 'demo123456' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const validationRules = {
    email: [validators.required, validators.email],
    password: [validators.required, validators.minLength(6)]
  };

  const { errors, validate, validateAll, getFieldError } = useValidation(validationRules);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateAll(formData)) {
      addNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo login - accept any valid email/password
      if (formData.email && formData.password.length >= 6) {
        setIsAuthenticated(true);
        addNotification('Добро пожаловать в AI Business Planner!', 'success');
      } else {
        throw new Error('Неверные учетные данные');
      }
    } catch (error) {
      handleError(error, 'Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'demo@example.com', password: 'demo123456' });
    addNotification('Демо-данные загружены', 'info', 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">AI Business Planner</h2>
          <p className="text-gray-600 mt-2">Войдите для доступа к платформе</p>
        </div>

        {/* Demo notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            🚀 Демо версия
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Используйте любой email и пароль длиннее 6 символов для входа
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDemoLogin}
            className="w-full"
          >
            Загрузить демо-данные
          </Button>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            error={getFieldError('email')}
            required
            autoComplete="email"
          />
          
          <Input
            label="Пароль"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            error={getFieldError('password')}
            required
            autoComplete="current-password"
            showPasswordToggle
          />
          
          <Button
            type="submit"
            loading={isLoading}
            disabled={Object.keys(errors).length > 0}
            fullWidth
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        {/* Additional info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button 
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => addNotification('Регистрация временно недоступна в демо', 'info')}
            >
              Зарегистрироваться
            </button>
          </p>
        </div>

        {/* Features preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Что вас ждет после входа:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span>AI помощник</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span>Экспорт в Word/PDF</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              <span>Анализ файлов</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              <span>Голосовой ввод</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};