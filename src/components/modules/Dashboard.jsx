import React, { useMemo } from 'react';
import { FileText, Brain, Target, Zap, Eye, TrendingUp, Users, DollarSign, Globe } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';

// Dashboard Stats Component
const DashboardStats = () => {
  const { businessPlans, chatHistory, apiStatus } = useAppContext();
  
  const connectedAPIs = Object.values(apiStatus).filter(status => status === 'connected').length;
  
  const stats = useMemo(() => [
    {
      title: 'Бизнес-планы',
      value: businessPlans.length,
      change: '+12% за месяц',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'AI Запросы',
      value: chatHistory.length + 1247,
      change: `сегодня: ${chatHistory.length}`,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'API Подключения',
      value: `${connectedAPIs}/3`,
      change: 'активных подключений',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Экономия времени',
      value: '147ч',
      change: 'за месяц',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ], [businessPlans.length, chatHistory.length, connectedAPIs]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Business Plans List Component
const BusinessPlansList = () => {
  const { businessPlans, exportDocument, addNotification, setActiveModule } = useAppContext();
  
  const handlePreview = (plan) => {
    addNotification(`Предварительный просмотр: ${plan.name}`, 'info', 3000);
  };
  
  const handleQuickExport = async (plan, format) => {
    try {
      await exportDocument(format, plan.content, plan.name);
    } catch (error) {
      addNotification(`Ошибка экспорта: ${error.message}`, 'error');
    }
  };

  const handleCreateNew = () => {
    setActiveModule('businessPlan');
    addNotification('Переход к созданию нового плана', 'info', 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Последние проекты</h3>
        <Button
          size="sm"
          onClick={handleCreateNew}
          className="text-sm"
        >
          Создать план
        </Button>
      </div>
      <div className="p-6">
        {businessPlans.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Нет созданных проектов</p>
            <Button onClick={handleCreateNew}>
              Создать первый бизнес-план
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {businessPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {plan.aiModel}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      plan.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status === 'completed' ? 'Завершен' : 'Черновик'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(plan)}
                    aria-label={`Просмотреть план ${plan.name}`}
                    icon={Eye}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickExport(plan, 'pdf')}
                    aria-label={`Экспортировать план ${plan.name}`}
                    icon={DollarSign}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// AI Models List Component
const AIModelsList = () => {
  const { aiModels, apiStatus, currentUser, setActiveModule } = useAppContext();
  
  const handleConfigureAPI = () => {
    setActiveModule('profile');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">AI Модели</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleConfigureAPI}
        >
          Настроить API
        </Button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(aiModels).map(([key, model]) => {
            const providerKey = key === 'gpt-4' ? 'openai' : key === 'claude-3' ? 'anthropic' : 'gemini';
            const isConnected = apiStatus[providerKey] === 'connected';
            const isActive = currentUser.preferences.aiModel === key;
            
            return (
              <div key={key} className={`p-4 border rounded-lg transition-colors ${
                isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                    aria-label={`Статус: ${isConnected ? 'подключен' : 'отключен'}`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{model.name}</h4>
                        {isActive && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Активная</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{model.provider}</p>
                      <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {model.strengths.map(strength => (
                          <span key={strength} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {key === 'gpt-4' ? '45%' : key === 'claude-3' ? '35%' : '20%'}
                    </p>
                    <p className="text-xs text-gray-500">использование</p>
                    <p className="text-xs text-gray-500 mt-1">{model.pricing}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const { setActiveModule, addNotification } = useAppContext();
  
  const actions = [
    {
      title: 'Новый бизнес-план',
      description: 'Создать план с AI помощником',
      icon: FileText,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setActiveModule('businessPlan')
    },
    {
      title: 'Анализ рынка',
      description: 'Исследование целевой аудитории',
      icon: Target,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        setActiveModule('businessPlan');
        addNotification('Переход к анализу рынка', 'info', 2000);
      }
    },
    {
      title: 'Финансовая модель',
      description: 'Построение прогнозов и метрик',
      icon: DollarSign,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => {
        setActiveModule('businessPlan');
        addNotification('Переход к финансовому моделированию', 'info', 2000);
      }
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-4 rounded-lg text-white text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${action.color}`}
          >
            <action.icon className="h-6 w-6 mb-3" />
            <h4 className="font-medium text-sm mb-1">{action.title}</h4>
            <p className="text-xs opacity-90">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
export const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Добро пожаловать в AI Business Planner! 🚀</h2>
        <p className="text-blue-100">
          Создавайте профессиональные бизнес-планы с помощью искусственного интеллекта. 
          Начните с анализа вашей идеи или загрузите существующие данные.
        </p>
      </div>
      
      {/* Stats */}
      <DashboardStats />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BusinessPlansList />
        <AIModelsList />
      </div>
    </div>
  );
};