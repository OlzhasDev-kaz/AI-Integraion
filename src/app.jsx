import React from 'react';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationList } from './components/ui/NotificationList';
import { Dashboard } from './components/modules/Dashboard';
import { BusinessPlanModule } from './components/modules/BusinessPlanModule';
import { UserProfile } from './components/modules/UserProfile';
import { LoginForm } from './components/LoginForm';
import { useAppContext } from './context/AppContext';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

const AppContent = () => {
  const { isAuthenticated, activeModule } = useAppContext();
  useKeyboardNavigation();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        <main role="main" className="animate-fade-in">
          {activeModule === 'dashboard' && <Dashboard />}
          {activeModule === 'businessPlan' && <BusinessPlanModule />}
          {activeModule === 'profile' && <UserProfile />}
        </main>
      </div>
      <NotificationList />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;