import React, { useState } from 'react';
import { User, Save, LogOut, Key, Globe, Bell, Shield, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useValidation } from '../../hooks/useValidation';
import { validators } from '../../utils/validators';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// API Keys Section
const APIKeysSection = () => {
  const { currentUser, setCurrentUser, addNotification, aiModels } = useAppContext();
  const [showKeys, setShowKeys] = useState({});
  const [tempKeys, setTempKeys] = useState(currentUser.apiKeys);
  
  const validationRules = {
    openai: [validators.apiKey('openai')],
    anthropic: [validators.apiKey('anthropic')],
    gemini: [validators.apiKey('gemini')]
  };
  
  const { errors, validate } = useValidation(validationRules);
  
  const handleKeyChange = (provider, value) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
    validate(provider, value);
  };
  
  const handleSaveKeys = () => {
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
      addNotification('Исправьте ошибки в API ключах', 'error');
      return;
    }
    
    setCurrentUser(prev => ({ ...prev, apiKeys: tempKeys }));
    addNotification('API ключи сохранены', 'success');
  };
  
  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };
  
  const apiProviders = [
    { key: 'openai', name: 'OpenAI', description: 'GPT-4 и другие модели OpenAI' },
    { key: 'anthropic', name: 'Anthropic', description: 'Claude 3 для длинных текстов' },
    { key: 'gemini', name: 'Google', description: 'Gemini Pro для мультимодальности' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Key className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">API Ключи</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Настройте API ключи для доступа к различным AI моделям. Ключи хранятся локально в вашем браузере.
      </p>
      
      <div className="space-y-4">
        {apiProviders.map(provider => (
          <div key={provider.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {provider.name}
              <span className="text-gray-500 font-normal ml-2">({provider.description})</span>
            </label>
            <div className="relative">
              <Input
                type={showKeys[provider.key] ? 'text' : 'password'}
                value={tempKeys[provider.key] || ''}
                onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                placeholder={`Введите ${provider.name} API ключ`}
                error={errors[provider.key]}
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility(provider.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys[provider.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {tempKeys[provider.key] && (
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${errors[provider.key] ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className={errors[provider.key] ? 'text-red-600' : 'text-green-600'}>
                  {errors[provider.key] ? 'Неверный формат' : 'Ключ валиден'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          onClick={handleSaveKeys}
          icon={Save}
          disabled={Object.values(errors).some(error => error)}
        >
          Сохранить API ключи
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <Shield className="h-3 w-3 inline mr-1" />
          API ключи не передаются на сервер и хранятся только в вашем браузере
        </p>
      </div>
    </div>
  );
};

// Profile Settings Section
const ProfileSettings = () => {
  const { currentUser, setCurrentUser, addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email
  });
  
  const validationRules = {
    name: [validators.required, validators.minLength(2)],
    email: [validators.required, validators.email]
  };
  
  const { errors, validate, validateAll } = useValidation(validationRules);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validate(field, value);
  };
  
  const handleSave = () => {
    if (validateAll(formData)) {
      setCurrentUser(prev => ({ ...prev, ...formData }));
      addNotification('Профиль обновлен', 'success');
    } else {
      addNotification('Исправьте ошибки в форме', 'error');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Профиль пользователя</h3>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-gray-600" />
        </div>
        <div>
          <h4 className="text-xl font-medium text-gray-900">{formData.name}</h4>
          <p className="text-gray-600">{formData.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Имя"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
        />
      </div>
      
      <div className="mt-6">
        <Button
          onClick={handleSave}
          icon={Save}
          disabled={Object.keys(errors).length > 0}
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

// Preferences Section
const PreferencesSection = () => {
  const { currentUser, setCurrentUser, addNotification, aiModels } = useAppContext();
  
  const handlePreferenceChange = (key, value) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
    addNotification('Настройки обновлены', 'success', 2000);
  };
  
  const languages = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' }
  ];
  
  const themes = [
    { code: 'light', name: 'Светлая тема' },
    { code: 'dark', name: 'Темная тема' },
    { code: 'auto', name: 'Автоматически' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Настройки приложения</h3>
      </div>
      
      <div className="space-y-6">
        {/* AI Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Модель по умолчанию
          </label>
          <select 
            value={currentUser.preferences.aiModel}
            onChange={(e) => handlePreferenceChange('aiModel', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(aiModels).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name} - {model.pricing}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {aiModels[currentUser.preferences.aiModel]?.description}
          </p>
        </div>
        
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Язык интерфейса
          </label>
          <select 
            value={currentUser.preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тема оформления
          </label>
          <select 
            value={currentUser.preferences.theme || 'light'}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {themes.map(theme => (
              <option key={theme.code} value={theme.code}>{theme.name}</option>
            ))}
          </select>
        </div>
        
        {/* Notification Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Длительность уведомлений (секунды)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={currentUser.preferences.notificationDuration / 1000}
            onChange={(e) => handlePreferenceChange('notificationDuration', parseInt(e.target.value) * 1000)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Boolean Preferences */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700">Дополнительные настройки</legend>
          
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              checked={currentUser.preferences.autoSave}
              onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm text-gray-700">Автосохранение диалогов</span>
              <p className="text-xs text-gray-500">Автоматически сохранять чаты с AI</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input 
              type="checkbox"
              checked={currentUser.preferences.voiceEnabled}
              onChange={(e) => handlePreferenceChange('voiceEnabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm text-gray-700">Голосовой ввод</span>
              <p className="text-xs text-gray-500">Включить распознавание речи</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox"
              checked={currentUser.preferences.accessibilityMode}
              onChange={(e) => handlePreferenceChange('accessibilityMode', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm text-gray-700">Режим доступности</span>
              <p className="text-xs text-gray-500">Улучшенная навигация с клавиатуры</p>
            </div>
          </label>
        </fieldset>
      </div>
    </div>
  );
};

// Notifications Section  
const NotificationsSection = () => {
  const { addNotification } = useAppContext();
  
  const testNotifications = [
    { type: 'success', message: 'Тестовое успешное уведомление' },
    { type: 'error', message: 'Тестовое уведомление об ошибке' },
    { type: 'warning', message: 'Тестовое предупреждение' },
    { type: 'info', message: 'Тестовое информационное уведомление' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Bell className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Уведомления</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Протестируйте систему уведомлений приложения
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {testNotifications.map((notification, index) => (
          <Button
            key={index}
            variant="secondary"
            size="sm"
            onClick={() => addNotification(notification.message, notification.type)}
            className="justify-start"
          >
            {notification.type === 'success' && '✅'}
            {notification.type === 'error' && '❌'}
            {notification.type === 'warning' && '⚠️'}
            {notification.type === 'info' && 'ℹ️'}
            <span className="ml-2 capitalize">{notification.type}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

// ИСПРАВЛЕН: Data Management Section с TXT экспортом
const DataManagementSection = () => {
  const { 
    chatHistory, 
    setChatHistory, 
    uploadedDatasets, 
    setUploadedDatasets, 
    businessPlans,
    currentUser,
    addNotification 
  } = useAppContext();
  
  const handleClearChat = () => {
    setChatHistory([]);
    addNotification('История чатов очищена', 'success');
  };
  
  const handleClearFiles = () => {
    setUploadedDatasets([]);
    addNotification('Загруженные файлы удалены', 'success');
  };
  
  // ИСПРАВЛЕНО: Экспорт в формате TXT
  const handleExportData = () => {
    try {
      // Создаем текстовый контент
      const exportDate = new Date().toLocaleString('ru-RU');
      let textContent = `AI BUSINESS PLANNER - ЭКСПОРТ ДАННЫХ
========================================
Дата экспорта: ${exportDate}
Пользователь: ${currentUser.name} (${currentUser.email})

========================================
ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
========================================
Имя: ${currentUser.name}
Email: ${currentUser.email}
AI модель по умолчанию: ${currentUser.preferences.aiModel}
Язык: ${currentUser.preferences.language}
Автосохранение: ${currentUser.preferences.autoSave ? 'Включено' : 'Отключено'}
Голосовой ввод: ${currentUser.preferences.voiceEnabled ? 'Включен' : 'Отключен'}

========================================
ИСТОРИЯ ЧАТОВ (${chatHistory.length} сообщений)
========================================
`;

      if (chatHistory.length > 0) {
        chatHistory.forEach((message, index) => {
          textContent += `
${index + 1}. [${message.timestamp}] ${message.sender === 'user' ? 'ПОЛЬЗОВАТЕЛЬ' : 'AI (' + message.model + ')'}:
${message.text}
${'='.repeat(50)}`;
        });
      } else {
        textContent += '\nИстория чатов пуста.\n';
      }

      textContent += `

========================================
БИЗНЕС-ПЛАНЫ (${businessPlans.length} планов)
========================================
`;

      if (businessPlans.length > 0) {
        businessPlans.forEach((plan, index) => {
          textContent += `
${index + 1}. ${plan.name}
   Дата: ${plan.date}
   Статус: ${plan.status === 'completed' ? 'Завершен' : 'Черновик'}
   AI модель: ${plan.aiModel}
   Содержание: ${plan.content || 'Нет содержания'}
${'='.repeat(50)}`;
        });
      } else {
        textContent += '\nБизнес-планы отсутствуют.\n';
      }

      textContent += `

========================================
ЗАГРУЖЕННЫЕ ФАЙЛЫ (${uploadedDatasets.length} файлов)
========================================
`;

      if (uploadedDatasets.length > 0) {
        uploadedDatasets.forEach((file, index) => {
          textContent += `
${index + 1}. ${file.name}
   Размер: ${file.size}
   Тип: ${file.type}
   Дата загрузки: ${file.uploadDate}
${'='.repeat(50)}`;
        });
      } else {
        textContent += '\nЗагруженные файлы отсутствуют.\n';
      }

      textContent += `

========================================
СТАТИСТИКА
========================================
Всего сообщений в чате: ${chatHistory.length}
Всего бизнес-планов: ${businessPlans.length}
Всего загруженных файлов: ${uploadedDatasets.length}

========================================
КОНЕЦ ЭКСПОРТА
========================================
`;

      // Создаем и скачиваем TXT файл
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-business-planner-data-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification('Данные экспортированы в TXT файл', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addNotification('Ошибка при экспорте данных', 'error');
    }
  };
  
  const dataStats = [
    { label: 'Сообщений в чате', value: chatHistory.length },
    { label: 'Загруженных файлов', value: uploadedDatasets.length },
    { label: 'Бизнес-планов', value: businessPlans.length }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Trash2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Управление данными</h3>
      </div>
      
      {/* Data Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {dataStats.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <Button
            onClick={handleExportData}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Экспорт в TXT
          </Button>
          <Button
            onClick={handleClearFiles}
            variant="secondary"
            size="sm"
            icon={Trash2}
          >
            Очистить файлы
          </Button>
        </div>
        
        <Button
          onClick={handleClearChat}
          variant="danger"
          size="sm"
          icon={Trash2}
          fullWidth
        >
          Очистить историю чатов
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💾 Экспорт создает подробный TXT файл со всеми вашими данными в читаемом формате
        </p>
      </div>
      
      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-800">
          ⚠️ Очистка данных необратима. Рекомендуем сначала экспортировать важную информацию.
        </p>
      </div>
    </div>
  );
};

// Account Actions Section
const AccountActionsSection = () => {
  const { setIsAuthenticated, addNotification } = useAppContext();
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    addNotification('Вы вышли из системы', 'info');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Действия с аккаунтом</h3>
      
      <div className="space-y-3">
        <Button
          onClick={handleLogout}
          variant="secondary"
          icon={LogOut}
          fullWidth
        >
          Выйти из аккаунта
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 В демо-версии данные не сохраняются между сессиями
        </p>
      </div>
    </div>
  );
};

// Main User Profile Component
export const UserProfile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Настройки профиля</h2>
        <p className="text-gray-600 mt-1">Управляйте своим аккаунтом и настройками приложения</p>
      </div>
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ProfileSettings />
          <PreferencesSection />
          <NotificationsSection />
        </div>
        
        <div className="space-y-8">
          <APIKeysSection />
          <DataManagementSection />
          <AccountActionsSection />
        </div>
      </div>
    </div>
  );
};