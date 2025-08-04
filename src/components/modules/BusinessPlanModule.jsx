import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, Download, Mic, MicOff, Copy, Brain, Send, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useValidation } from '../../hooks/useValidation';
import { validators } from '../../utils/validators';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProgressBar } from '../ui/ProgressBar';

// Chat Interface Component - ИСПРАВЛЕНО
const ChatInterface = () => {
  const { 
    chatHistory,
    createChatMessage,
    isLoading, 
    setIsLoading, 
    currentUser, 
    user,
    aiModels, 
    apiStatus,
    addNotification,
    generateAIResponse,
    isRecording,
    startVoiceRecording,
    handleError
  } = useAppContext();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef(null);
  
  const validationRules = {
    message: [validators.required, validators.minLength(2)]
  };
  
  const { errors, validate } = useValidation(validationRules);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // ИСПРАВЛЕНО: Функция отправки сообщения
  const handleSendMessage = async (e) => {
    // Предотвращаем отправку формы если это событие формы
    if (e) {
      e.preventDefault();
    }
    
    // Проверяем валидность сообщения
    const messageError = validate('message', currentMessage);
    if (messageError) {
      addNotification('Введите сообщение для отправки', 'warning');
      return;
    }

    // Проверяем что сообщение не пустое
    if (!currentMessage.trim()) {
      addNotification('Введите сообщение для отправки', 'warning');
      return;
    }

    try {
      const userMessage = currentMessage.trim();
      
      // Save user message to database if authenticated
      if (user?.id && currentUser.preferences.autoSave) {
        try {
          await createChatMessage({
            message: userMessage,
            sender: 'user'
          });
        } catch (dbError) {
          console.error('Error saving user message to database:', dbError);
        }
      }
      
      // Очищаем поле ввода
      setCurrentMessage('');
      setIsLoading(true);

      // Генерируем ответ AI
      const aiResponseText = await generateAIResponse(userMessage);
      
      if (currentUser.preferences.autoSave) {
        addNotification('Диалог автоматически сохранен', 'success', 2000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      handleError(error, 'Chat');
    } finally {
      setIsLoading(false);
    }
  };

  // ИСПРАВЛЕНО: Обработка Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = async () => {
    try {
      const voiceText = await startVoiceRecording();
      if (voiceText) {
        setCurrentMessage(voiceText);
      }
    } catch (error) {
      handleError(error, 'Voice Input');
    }
  };
  
  const quickActions = [
    'Создать бизнес-план для SaaS',
    'Анализ рынка B2B сферы', 
    'Финансовая модель стартапа',
    'Конкурентный анализ',
    'Go-to-market стратегия',
    'Оценка рисков проекта'
  ];
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addNotification('Скопировано в буфер обмена', 'success', 2000);
  };
  
  const currentModel = aiModels[currentUser.preferences.aiModel];
  const modelProvider = currentUser.preferences.aiModel === 'gpt-4' ? 'openai' : 
                       currentUser.preferences.aiModel === 'claude-3' ? 'anthropic' : 'gemini';
  const isModelOnline = apiStatus[modelProvider] === 'connected';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            AI Помощник ({currentModel?.name})
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isModelOnline ? 'Онлайн' : 'Оффлайн'}
          </span>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="h-96 overflow-y-auto p-6 custom-scrollbar">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium text-lg mb-2">Готов помочь создать бизнес-план</h4>
            <p className="text-sm mb-6">
              Опишите вашу бизнес-идею или задайте конкретный вопрос
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Финансовое моделирование</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Анализ рынка</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>Стратегия развития</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                <span>Оценка рисков</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative group ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <time>{message.timestamp}</time>
                    <div className="flex items-center space-x-2">
                      {message.model && (
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                          {aiModels[message.model]?.name}
                        </span>
                      )}
                      {message.sender === 'ai' && (
                        <button
                          onClick={() => copyToClipboard(message.text)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-white hover:bg-opacity-20 p-1 rounded transition-opacity"
                          aria-label="Копировать сообщение"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {currentModel?.name} генерирует ответ...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      
      {/* ИСПРАВЛЕНО: Input area с формой */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                validate('message', e.target.value);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Создать бизнес-план для SaaS стартапа в сфере образования..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            {errors.message && (
              <p className="text-xs text-red-600 mt-1">{errors.message}</p>
            )}
          </div>
          
          {currentUser.preferences.voiceEnabled && (
            <Button
              type="button"
              onClick={handleVoiceInput}
              disabled={isRecording}
              variant={isRecording ? 'danger' : 'secondary'}
              icon={isRecording ? MicOff : Mic}
              aria-label={isRecording ? 'Остановить запись' : 'Начать голосовую запись'}
            />
          )}
          
          <Button
            type="submit"
            loading={isLoading}
            disabled={!currentMessage.trim() || !!errors.message || isLoading}
            icon={Send}
            aria-label="Отправить сообщение"
          />
        </form>
        
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickActions.map(action => (
            <button
              key={action}
              type="button"
              onClick={() => setCurrentMessage(action)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// File Uploader Component (остается без изменений)
const FileUploader = () => {
  const { 
    uploadedDatasets,
    deleteUploadedFile,
    addNotification, 
    handleError, 
    uploadFileWithProgress, 
    uploadProgress 
  } = useAppContext();
  
  const fileInputRef = useRef(null);
  
  const validationRules = {
    file: [
      validators.fileType(['.csv', '.xlsx', '.json', '.txt', '.pdf']),
      validators.fileSize(10)
    ]
  };
  
  const { errors, validate } = useValidation(validationRules);
  
  const handleFileUpload = async (event) => {
    try {
      const files = Array.from(event.target.files);
      
      for (const file of files) {
        if (validate('file', file)) {
          continue;
        }
        
        await uploadFileWithProgress(file);
      }
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      handleError(error, 'File Upload');
    }
  };
  
  const removeFile = (id) => {
    deleteUploadedFile(id);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (!validate('file', file)) {
        await uploadFileWithProgress(file);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Загрузка данных</h3>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".csv,.xlsx,.json,.txt,.pdf"
        className="hidden"
      />
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
      >
        <Upload className="h-8 w-8 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 text-center mb-2">
          <span className="font-medium">Нажмите для выбора</span> или перетащите файлы сюда
        </p>
        <p className="text-xs text-gray-500">CSV, Excel, JSON, PDF, TXT (макс. 10MB)</p>
      </div>
      
      {errors.file && (
        <p className="mt-2 text-sm text-red-600">{errors.file}</p>
      )}
      
      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Загрузка файлов:</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Загрузка...</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar progress={progress} size="sm" />
            </div>
          ))}
        </div>
      )}
      
      {/* Uploaded Files */}
      {uploadedDatasets.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Загруженные файлы ({uploadedDatasets.length}):
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {uploadedDatasets.map(dataset => (
              <div key={dataset.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{dataset.name}</p>
                  <p className="text-gray-500 text-xs">{dataset.size} • {dataset.uploadDate}</p>
                </div>
                <Button
                  onClick={() => removeFile(dataset.id)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-600 hover:text-red-800"
                  aria-label={`Удалить файл ${dataset.name}`}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export Panel Component (остается без изменений)
const ExportPanel = () => {
  const { addNotification, exportDocument, exportProgress, chatHistory, user } = useAppContext();
  
  const exportOptions = [
    { format: 'docx', icon: '📄', name: 'Word документ', description: 'Редактируемый документ' },
    { format: 'xlsx', icon: '📊', name: 'Excel таблица', description: 'Финансовые данные' },
    { format: 'pdf', icon: '📋', name: 'PDF отчет', description: 'Готовый к печати' },
    { format: 'pptx', icon: '📈', name: 'PowerPoint', description: 'Презентация для инвесторов' }
  ];
  
  const handleExport = async (format, name) => {
    if (!user) {
      addNotification('Войдите в систему для экспорта', 'warning');
      return;
    }
    
    if (chatHistory.length === 0) {
      addNotification('Создайте диалог с AI перед экспортом', 'warning');
      return;
    }
    
    try {
      const content = chatHistory
        .filter(msg => msg.sender === 'ai')
        .map(msg => msg.text)
        .join('\n\n');
        
      await exportDocument(format, content, `Business Plan - ${new Date().toLocaleDateString('ru-RU')}`);
    } catch (error) {
      addNotification(`Ошибка экспорта: ${error.message}`, 'error');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Экспорт бизнес-плана</h3>
      
      {/* Export Progress */}
      {Object.keys(exportProgress).length > 0 && (
        <div className="mb-6 space-y-3">
          {Object.entries(exportProgress).map(([exportId, progress]) => (
            <div key={exportId} className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>{progress.title} ({progress.format.toUpperCase()})</span>
                <span>{progress.progress}%</span>
              </div>
              <ProgressBar progress={progress.progress} size="sm" />
              {progress.message && (
                <p className="text-xs text-blue-600 mt-1">{progress.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exportOptions.map(option => (
          <button
            key={option.format}
            onClick={() => handleExport(option.format, option.name)}
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
          >
            <span className="text-2xl mr-3 mt-1">{option.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">{option.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
            <Download className="h-4 w-4 text-gray-400 ml-2 mt-1" />
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 Совет: {user ? 'Ваши диалоги автоматически сохраняются в облаке' : 'Войдите в систему для сохранения диалогов'}
        </p>
      </div>
    </div>
  );
};

// Main Business Plan Module
export const BusinessPlanModule = () => {
  const { currentUser, setCurrentUser, aiModels, addNotification } = useAppContext();
  
  const handleModelChange = (model) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, aiModel: model }
    }));
    addNotification(`Переключено на ${aiModels[model].name}`, 'info', 2000);
  };
  
  const handleCreateNew = () => {
    addNotification('Новый бизнес-план создан', 'success', 2000);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Генератор бизнес-планов</h2>
          <p className="text-gray-600 mt-1">Создавайте профессиональные бизнес-планы с помощью ИИ</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select 
            value={currentUser.preferences.aiModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(aiModels).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name} ({model.pricing})
              </option>
            ))}
          </select>
          <Button
            onClick={handleCreateNew}
            icon={Plus}
            aria-label="Создать новый бизнес-план"
          >
            Новый план
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat interface - takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>
        
        {/* Sidebar tools - takes 1/3 of the space */}
        <div className="space-y-6">
          <FileUploader />
          <ExportPanel />
        </div>
      </div>
    </div>
  );
};