import React from 'react';
import { BarChart3, FileText, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Navigation = () => {
  const { activeModule, setActiveModule } = useAppContext();
  
  const navItems = [
    { 
      id: 'dashboard', 
      name: 'Дашборд', 
      icon: BarChart3,
      description: 'Обзор и аналитика'
    },
    { 
      id: 'businessPlan', 
      name: 'Бизнес-планы', 
      icon: FileText,
      description: 'Создание и управление планами'
    },
    { 
      id: 'profile', 
      name: 'Настройки', 
      icon: Settings,
      description: 'Профиль и конфигурация'
    }
  ];
  
  return (
    <nav className="mb-8" role="navigation" aria-label="Основная навигация">
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              activeModule === item.id
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-current={activeModule === item.id ? 'page' : undefined}
            title={item.description}
          >
            <item.icon className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="hidden sm:block">{item.name}</span>
            <span className="sm:hidden">{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      
      {/* Mobile breadcrumb */}
      <div className="mt-2 sm:hidden">
        <p className="text-xs text-gray-500 text-center">
          {navItems.find(item => item.id === activeModule)?.description}
        </p>
      </div>
    </nav>
  );
};