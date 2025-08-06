import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
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
  // Supabase integration
  const { 
    user, 
    session, 
    loading: authLoading, 
    signUp, 
    signIn, 
    signOut,
    createProfile,
    getProfile,
    updateProfile,
    createChatMessage,
    getChatMessages,
    clearChatMessages,
    createBusinessPlan,
    getBusinessPlans,
    createUploadedFile,
    getUploadedFiles,
    deleteUploadedFile,
    clearUploadedFiles
  } = useSupabase();

  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(!!session);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [exportProgress, setExportProgress] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Database-backed state
  const [chatHistory, setChatHistory] = useState([]);
  const [businessPlans, setBusinessPlans] = useState([]);
  const [uploadedDatasets, setUploadedDatasets] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    apiKeys: {},
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

  // Load user data when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setIsAuthenticated(true);
        
        // Set user data from ACTUAL authenticated user immediately
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const userEmail = user.email;
        
        console.log('Authenticated user:', { userName, userEmail, user }); // Debug log
        
        try {
          // Get or create profile
          let { data: profile, error } = await getProfile();
          
          if (error && error.message?.includes('0 rows')) {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await createProfile({
              name: userName,
              email: userEmail,
              preferences: {
                language: 'ru',
                aiModel: 'gpt-4',
                autoSave: true,
                voiceEnabled: true,
                accessibilityMode: false,
                notificationDuration: 5000,
                theme: 'light'
              },
              api_keys: {}
            });
            
            if (!createError) {
              profile = newProfile;
            }
          }
          
          if (profile) {
            setCurrentUser({
              name: profile.name,
              email: profile.email,
              apiKeys: profile.api_keys || {},
              preferences: {
                language: 'ru',
                aiModel: 'gpt-4',
                autoSave: true,
                voiceEnabled: true,
                accessibilityMode: false,
                notificationDuration: 5000,
                theme: 'light',
                ...profile.preferences
              }
            });
          } else {
            // If no profile found, use ACTUAL authenticated user data
            setCurrentUser({
              name: userName,
              email: userEmail,
              apiKeys: {},
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
          }
          
          // Load chat messages
          const { data: messages } = await getChatMessages();
          if (messages) {
            const formattedMessages = messages.map(msg => ({
              id: msg.id,
              text: msg.message,
              sender: msg.sender,
              timestamp: new Date(msg.created_at).toLocaleTimeString('ru-RU'),
              model: msg.ai_model
            }));
            setChatHistory(formattedMessages);
          }
          
          // Load business plans
          const { data: plans } = await getBusinessPlans();
          if (plans) {
            const formattedPlans = plans.map(plan => ({
              id: plan.id,
              name: plan.name,
              content: plan.content,
              status: plan.status,
              aiModel: plan.ai_model,
              date: new Date(plan.created_at).toLocaleDateString('ru-RU'),
              created_at: plan.created_at,
              updated_at: plan.updated_at
            }));
            setBusinessPlans(formattedPlans);
          }
          
          // Load uploaded files
          const { data: files } = await getUploadedFiles();
          if (files) {
            const formattedFiles = files.map(file => ({
              id: file.id,
              name: file.name,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              type: file.type,
              uploadDate: new Date(file.created_at).toLocaleDateString('ru-RU'),
              content: file.content
            }));
            setUploadedDatasets(formattedFiles);
          }
          
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setIsAuthenticated(false);
        // Reset to demo data when not authenticated
        setChatHistory([]);
        setBusinessPlans([]);
        setUploadedDatasets([]);
        setCurrentUser({
          name: 'Demo User',
          email: 'demo@example.com',
          apiKeys: {},
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
      }
    };

    if (!authLoading) {
      loadUserData();
    }
  }, [user, authLoading]);

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
  const apiStatus = useMemo(() => {
    const keys = currentUser.apiKeys;
    return {
      openai: keys?.openai && keys.openai.trim() ? 'connected' : 'disconnected',
      anthropic: keys?.anthropic && keys.anthropic.trim() ? 'connected' : 'disconnected', 
      gemini: keys?.gemini && keys.gemini.trim() ? 'connected' : 'disconnected'
    };
  }, [currentUser.apiKeys]);

  // Notification system
  const addNotification = useCallback((messageKey, type = 'info', duration = null, actions = null) => {
    try {
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

  // Update current user and save to database
  const updateCurrentUser = useCallback(async (updates) => {
    const newUserData = { ...currentUser, ...updates };
    setCurrentUser(newUserData);
    
    if (user) {
      try {
        await updateProfile({
          name: newUserData.name,
          email: newUserData.email,
          preferences: newUserData.preferences,
          api_keys: newUserData.apiKeys
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }, [currentUser, user, updateProfile]);

  // AI Response generation with database save
  const generateAIResponse = useCallback(async (prompt) => {
    try {
      const model = aiModels[currentUser.preferences.aiModel];
      const apiKeyField = currentUser.preferences.aiModel === 'gpt-4' ? 'openai' :
                          currentUser.preferences.aiModel === 'claude-3' ? 'anthropic' : 'gemini';
      
      const apiKey = currentUser.apiKeys[apiKeyField];

      setIsLoading(true);
      const response = await AIService.callAI(currentUser.preferences.aiModel, prompt, apiKey);
      
      // Create message objects
      const userMessage = {
        id: Date.now(),
        text: prompt,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        model: currentUser.preferences.aiModel
      };
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        model: currentUser.preferences.aiModel
      };
      
      // Update local state
      setChatHistory(prev => [...prev, userMessage, aiMessage]);
      
      // Save to database if authenticated
      if (user && currentUser.preferences.autoSave) {
        try {
          await createChatMessage({
            message: prompt,
            sender: 'user',
            ai_model: currentUser.preferences.aiModel
          });
          
          await createChatMessage({
            message: response,
            sender: 'ai',
            ai_model: currentUser.preferences.aiModel
          });
        } catch (error) {
          console.error('Error saving chat messages:', error);
        }
      }
      
      return response;
    } catch (error) {
      handleError(error, 'AI Response Generation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.preferences.aiModel, currentUser.apiKeys, aiModels, user, currentUser.preferences.autoSave]);

  // Error handling
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    setError(error.message || 'Произошла неизвестная ошибка');
    addNotification(`Ошибка: ${error.message}`, 'error');
  }, [addNotification]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // File upload with database save
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
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0],
        content: content.substring(0, 1000) + (content.length > 1000 ? '...' : '')
      };

      setUploadedDatasets(prev => [newDataset, ...prev]);

      // Save to database if authenticated
      if (user) {
        try {
          await createUploadedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            content: content.substring(0, 1000) + (content.length > 1000 ? '...' : '')
          });
        } catch (error) {
          console.error('Error saving uploaded file:', error);
        }
      }

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
  }, [addNotification, user]);

  // Delete uploaded file with database sync
  const deleteUploadedFileLocal = useCallback(async (id) => {
    setUploadedDatasets(prev => prev.filter(file => file.id !== id));
    
    if (user) {
      try {
        await deleteUploadedFile(id);
      } catch (error) {
        console.error('Error deleting file from database:', error);
      }
    }
    
    addNotification('Файл удален', 'success', 2000);
  }, [addNotification, user]);

  // Clear chat history with database sync
  const clearChatHistory = useCallback(async () => {
    setChatHistory([]);
    
    if (user) {
      try {
        await clearChatMessages();
      } catch (error) {
        console.error('Error clearing chat messages:', error);
      }
    }
    
    addNotification('История чатов очищена', 'success');
  }, [addNotification, user]);

  // Clear uploaded files with database sync
  const clearUploadedFilesLocal = useCallback(async () => {
    setUploadedDatasets([]);
    
    if (user) {
      try {
        await clearUploadedFiles();
      } catch (error) {
        console.error('Error clearing uploaded files:', error);
      }
    }
    
    addNotification('Загруженные файлы удалены', 'success');
  }, [addNotification, user]);

  // Authentication functions
  const handleSignUp = useCallback(async (email, password, userData = {}) => {
    try {
      const { data, error } = await signUp(email, password, userData);
      if (error) throw error;
      
      addNotification('Аккаунт создан успешно!', 'success');
      return { data };
    } catch (error) {
      addNotification(`Ошибка регистрации: ${error.message}`, 'error');
      return { error };
    }
  }, [signUp, addNotification]);

  const handleSignIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      
      addNotification('Добро пожаловать!', 'success');
      return { data };
    } catch (error) {
      addNotification(`Ошибка входа: ${error.message}`, 'error');
      return { error };
    }
  }, [signIn, addNotification]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      addNotification('Вы вышли из системы', 'info');
      setActiveModule('dashboard');
    } catch (error) {
      addNotification(`Ошибка выхода: ${error.message}`, 'error');
    }
  }, [signOut, addNotification]);

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
        0,
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
      throw error;
    } finally {
      setIsRecording(false);
    }
  }, [addNotification, handleError]);

  // Context value
  const value = useMemo(() => ({
    // State
    currentUser,
    setCurrentUser: updateCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    authLoading,
    activeModule,
    setActiveModule,
    chatHistory,
    setChatHistory: clearChatHistory,
    isLoading,
    setIsLoading,
    isRecording,
    setIsRecording,
    businessPlans,
    uploadedDatasets,
    setUploadedDatasets: clearUploadedFilesLocal,
    notifications,
    setNotifications,
    error,
    uploadProgress,
    exportProgress,
    
    // Supabase data
    user,
    session,

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
    deleteUploadedFile: deleteUploadedFileLocal,
    exportDocument,
    startVoiceRecording,
    t,
    
    // Auth functions
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    
    // Database functions
    createChatMessage,
    createBusinessPlan,
    createUploadedFile
  }), [
    currentUser, updateCurrentUser, isAuthenticated, authLoading, activeModule, chatHistory, clearChatHistory,
    isLoading, isRecording, businessPlans, uploadedDatasets, clearUploadedFilesLocal, notifications, error, 
    uploadProgress, exportProgress, user, session, aiModels, apiStatus, addNotification, removeNotification, 
    generateAIResponse, handleError, clearError, uploadFileWithProgress, deleteUploadedFileLocal, exportDocument, 
    startVoiceRecording, t, handleSignUp, handleSignIn, handleSignOut
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};