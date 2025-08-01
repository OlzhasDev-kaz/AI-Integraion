import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AIService } from '../services/AIService';
import { ExportService } from '../services/ExportService';
import { translate } from '../utils/translations';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State management
  const [currentUser, setCurrentUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    apiKeys: {
      openai: '',
      anthropic: '',
      gemini: ''
    },
    preferences: {
      language: 'ru',
      aiModel: 'gpt-4',
      autoSave: true,
      voiceEnabled: true,
      accessibilityMode: false,
      notificationDuration: 5000,
      theme: 'light'
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [exportProgress, setExportProgress] = useState({});

  const [businessPlans, setBusinessPlans] = useState([
    {
      id: 1,
      name: 'Tech Startup Plan',
      date: '2025-07-15',
      status: 'completed',
      aiModel: 'gpt-4',
      content: 'Detailed tech startup business plan with market analysis and financial projections...'
    },
    {
      id: 2,
      name: 'Restaurant Business',
      date: '2025-07-20',
      status: 'draft',
      aiModel: 'claude-3',
      content: 'Restaurant business plan focusing on local market and sustainable practices...'
    }
  ]);

  const [uploadedDatasets, setUploadedDatasets] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Translation function
  const t = useCallback((key, fallback = key) => {
    return translate(key, currentUser.preferences.language, fallback);
  }, [currentUser.preferences.language]);

  // AI Models configuration
  const aiModels = useMemo(() => ({
    'gpt-4': {
      name: 'GPT-4',
      provider: 'OpenAI',
      strengths: ['Аналитика', 'Структурирование', 'Логика'],
      pricing: '$0.03/1K tokens',
      description: 'Лучший выбор для комплексного анализа и структурированных бизнес-планов'
    },
    'claude-3': {
      name: 'Claude 3',
      provider: 'Anthropic',
      strengths: ['Длинные тексты', 'Этика', 'Детализация'],
      pricing: '$0.025/1K tokens',
      description: 'Идеален для подробных описаний и этических аспектов бизнеса'
    },
    'gemini-pro': {
      name: 'Gemini Pro',
      provider: 'Google',
      strengths: ['Мультимодальность', 'Код', 'Данные'],
      pricing: '$0.002/1K tokens',
      description: 'Отлично работает с данными и техническими решениями'
    }
  }), []);

  // API Status
  const apiStatus = useMemo(() => ({
    openai: currentUser.apiKeys.openai ? 'connected' : 'disconnected',
    anthropic: currentUser.apiKeys.anthropic ? 'connected' : 'disconnected',
    gemini: currentUser.apiKeys.gemini ? 'connected' : 'disconnected'
  }), [currentUser.apiKeys]);

  // Notification system with translations
  const addNotification = useCallback((messageKey, type = 'info', duration = null, actions = null) => {
    try {
      // If messageKey is already a translated string, use it directly
      const message = messageKey.includes('.') ? t(messageKey) : messageKey;
      
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        actions: actions || [],
        persistent: duration === 0
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);

      const actualDuration = duration !== null ? duration : currentUser.preferences.notificationDuration;

      if (actualDuration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, actualDuration);
      }
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  }, [currentUser.preferences.notificationDuration, t]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // AI Response generation
  const generateAIResponse = useCallback(async (prompt) => {
    try {
      const model = aiModels[currentUser.preferences.aiModel];
      const apiKeyField = currentUser.preferences.aiModel === 'gpt-4' ? 'openai' :
                          currentUser.preferences.aiModel === 'claude-3' ? 'anthropic' : 'gemini';
      const apiKey = currentUser.apiKeys[apiKeyField];

      if (!apiKey) {
        addNotification(`Настройте API ключ для ${model.name} в профиле`, 'warning', 8000);
        // Fallback to mock response
        return AIService.generateMockResponse(prompt);
      }

      const response = await AIService.callAI(currentUser.preferences.aiModel, prompt, apiKey);
      return response;
    } catch (err) {
      console.error('AI Response Error:', err);
      addNotification(`Ошибка AI: ${err.message}`, 'error', 8000);
      // Fallback to mock response
      return AIService.generateMockResponse(prompt);
    }
  }, [currentUser.preferences.aiModel, currentUser.apiKeys, aiModels, addNotification]);

  // Error handling
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    setError(error.message || 'Произошла неизвестная ошибка');
    addNotification(`Ошибка${context ? ` в ${context}` : ''}: ${error.message}`, 'error', 8000);
  }, [addNotification]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // File upload with progress
  const uploadFileWithProgress = useCallback(async (file) => {
    const fileId = Date.now() + Math.random();

    try {
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate upload progress
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const progress = (i / totalSteps) * 100;
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }

      // Process file content
      let content = '';
      try {
        if (file.type === 'application/json') {
          content = await file.text();
        } else if (file.type.includes('text') || file.name.endsWith('.csv')) {
          content = await file.text();
        } else {
          content = `Binary file: ${file.name}`;
        }
      } catch (err) {
        content = `File processing error: ${err.message}`;
      }

      const newDataset = {
        id: fileId,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0],
        content: content.substring(0, 1000) + (content.length > 1000 ? '...' : '')
      };

      setUploadedDatasets(prev => [...prev, newDataset]);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });

      addNotification(`Файл "${file.name}" успешно загружен`, 'success', 3000);
      return newDataset;
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      throw error;
    }
  }, [addNotification]);

  // Export with progress
  const exportDocument = useCallback(async (format, content, title) => {
    const exportId = Date.now();

    try {
      setExportProgress(prev => ({ ...prev, [exportId]: { progress: 0, format, title } }));

      const steps = [
        { progress: 25, message: 'Подготовка данных...' },
        { progress: 50, message: 'Форматирование контента...' },
        { progress: 75, message: 'Генерация документа...' },
        { progress: 100, message: 'Завершение экспорта...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExportProgress(prev => ({
          ...prev,
          [exportId]: { ...prev[exportId], progress: step.progress, message: step.message }
        }));
      }

      const downloadUrl = await ExportService.exportDocument(format, content, title);

      setExportProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[exportId];
        return newProgress;
      });

      addNotification(
        `Документ "${title}" готов к скачиванию`,
        'success',
        0, // persistent
        [{
          label: 'Скачать',
          action: () => {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${title}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            removeNotification();
          }
        }]
      );

      return downloadUrl;
    } catch (error) {
      setExportProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[exportId];
        return newProgress;
      });
      throw error;
    }
  }, [addNotification]);

  // Voice recording
  const startVoiceRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      addNotification('Начинаю запись голоса...', 'info', 2000);

      // Simulate voice recognition
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const voicePrompts = [
        'Создать бизнес-план для SaaS стартапа в сфере образования',
        'Помоги с финансовой моделью для мобильного приложения',
        'Анализ рынка для экологически чистых продуктов',
        'Стратегия выхода на международный рынок'
      ];
      
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      
      addNotification('Голосовое сообщение распознано', 'success', 3000);
      return randomPrompt;
    } catch (error) {
      handleError(error, 'Voice Recording');
      return null;
    } finally {
      setIsRecording(false);
    }
  }, [addNotification, handleError]);

  // Language change handler
  const changeLanguage = useCallback((newLanguage) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, language: newLanguage }
    }));
    
    // Translate notification
    const welcomeMessages = {
      'ru': 'Язык изменен на русский',
      'en': 'Language changed to English',
      'zh': '语言已更改为中文'
    };
    
    addNotification(welcomeMessages[newLanguage] || 'Language changed', 'success', 3000);
  }, [addNotification]);

  // Context value
  const value = useMemo(() => ({
    // State
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    activeModule,
    setActiveModule,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    isRecording,
    setIsRecording,
    businessPlans,
    setBusinessPlans,
    uploadedDatasets,
    setUploadedDatasets,
    notifications,
    setNotifications,
    error,
    uploadProgress,
    exportProgress,

    // Constants
    aiModels,
    apiStatus,

    // Functions
    addNotification,
    removeNotification,
    generateAIResponse,
    handleError,
    clearError,
    uploadFileWithProgress,
    exportDocument,
    startVoiceRecording,
    changeLanguage,
    t // Translation function
  }), [
    currentUser, isAuthenticated, activeModule, chatHistory, isLoading, isRecording,
    businessPlans, uploadedDatasets, notifications, error, uploadProgress, exportProgress,
    aiModels, apiStatus, addNotification, removeNotification, generateAIResponse,
    handleError, clearError, uploadFileWithProgress, exportDocument, startVoiceRecording,
    changeLanguage, t
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};