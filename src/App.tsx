import React, { useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CropsModule from './components/modules/CropsModule';
import LivestockModule from './components/modules/LivestockModule';
import InventoryModule from './components/modules/InventoryModule';
import SalesModule from './components/modules/SalesModule';
import FinanceModule from './components/modules/FinanceModule';
import RealEstateModule from './components/modules/RealEstateModule';
import HRModule from './components/modules/HRModule';
import AnalyticsModule from './components/modules/AnalyticsModule';
import CalendarModule from './components/modules/CalendarModule';
import ConstructionModule from './components/modules/ConstructionModule';
import SettingsModule from './components/modules/SettingsModule';
import { supabase } from './hooks/useSupabase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (!mounted) return;
        setUser(session?.user || null);
        setLoading(false);
      })();
    });

    (async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error) {
          setLoading(false);
          return;
        }
        setUser(user);
      } catch {
        if (mounted) setLoading(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch {
        // ignore
      }
    })();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <CropsModule />;
      case 'livestock':
        return <LivestockModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'sales':
        return <SalesModule />;
      case 'realestate':
        return <RealEstateModule />;
      case 'hr':
        return <HRModule />;
      case 'finance':
        return <FinanceModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'construction':
        return <ConstructionModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
        />
        <main className="flex-1 lg:ml-64">
          {renderContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
