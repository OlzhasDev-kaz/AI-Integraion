import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useValidation } from '../hooks/useValidation';
import { validators } from '../utils/validators';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const LoginForm = () => {
  const { signIn, addNotification, handleError, authLoading } = useAppContext();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
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
      
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      handleError(error, 'Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'demo@example.com', password: 'demo123' });
    addNotification('Демо-данные загружены', 'info', 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

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
            🚀 Supabase Backend
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Создайте аккаунт или войдите с существующими данными
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
              onClick={() => addNotification('Функция регистрации будет добавлена позже', 'info')}
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
              <span>Сохранение данных</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span>Синхронизация</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              <span>История чатов</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              <span>Облачное хранение</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};