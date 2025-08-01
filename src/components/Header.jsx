import React from 'react';
import { Brain, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';

export const Header = () => {
  const { currentUser, setActiveModule, apiStatus } = useAppContext();
  
  const connectedAPIs = Object.values(apiStatus).filter(status => status === 'connected').length;
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900">AI Business Planner</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1" role="status" aria-label="Статус API">
                <div className={`w-2 h-2 rounded-full ${connectedAPIs > 0 ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></div>
                <span>{connectedAPIs}/3 API подключено</span>
              </div>
            </div>
          </div>
          
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              Привет, <span className="font-medium">{currentUser.name}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveModule('profile')}
              aria-label="Перейти в профиль"
              icon={User}
              className="p-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
};