import React from 'react';
import { Home, Wheat, Cog as Cow, ShoppingCart, Building2, Users, BarChart3, DollarSign, Package, Calendar, Settings, HardHat } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'crops', label: 'Cultures', icon: Wheat },
    { id: 'livestock', label: 'Bétail', icon: Cow },
    { id: 'sales', label: 'Ventes', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventaire', icon: Package },
    { id: 'realestate', label: 'Immobilier', icon: Building2 },
    { id: 'construction', label: 'Chantiers', icon: HardHat },
    { id: 'hr', label: 'Ressources Humaines', icon: Users },
    { id: 'finance', label: 'Comptabilité', icon: DollarSign },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside className={`bg-gray-900 text-white w-64 min-h-screen fixed left-0 top-16 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
