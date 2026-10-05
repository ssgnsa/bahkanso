import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Wheat, Cog as Cow, Building2, Package, AlertTriangle, HardHat, Calendar, ShoppingCart } from 'lucide-react';
import { supabase } from '../hooks/useSupabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    balance: 0,
    totalParcelles: 0,
    totalAnimals: 0,
    totalEmployees: 0,
    totalProperties: 0,
    totalSales: 0,
    pendingTasks: 0,
    activeConstructions: 0,
    inventoryValue: 0,
  });
  const [alerts, setAlerts] = React.useState<{ type: string; message: string; severity: 'high' | 'medium' | 'low' }[]>([]);
  const [recentActivities, setRecentActivities] = React.useState<{ id: string; type: string; description: string; amount: string; time: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [parcellesRes, animalsRes, employeesRes, transactionsRes, salesRes, propertiesRes, inventoryRes, tasksRes, constructionsRes] = await Promise.all([
        supabase.from('parcelles').select('area, name, status, harvest').eq('user_id', user.id),
        supabase.from('animals').select('count, type, vaccination').eq('user_id', user.id),
        supabase.from('employees').select('salary, status').eq('user_id', user.id),
        supabase.from('transactions').select('type, amount, description, date, category').eq('user_id', user.id).order('date', { ascending: false }).limit(10),
        supabase.from('sales').select('total_amount, sale_date, product_name, buyer').eq('user_id', user.id).order('sale_date', { ascending: false }).limit(5),
        supabase.from('properties').select('monthly_rent, status, name').eq('user_id', user.id),
        supabase.from('inventory').select('value, name, quantity, min_stock').eq('user_id', user.id),
        supabase.from('tasks').select('title, date, status, type').eq('user_id', user.id),
        supabase.from('constructions').select('name, status, budget, spent, progress').eq('user_id', user.id),
      ]);

      const parcelles = parcellesRes.data || [];
      const animals = animalsRes.data || [];
      const employees = employeesRes.data || [];
      const transactions = transactionsRes.data || [];
      const sales = salesRes.data || [];
      const properties = propertiesRes.data || [];
      const inventory = inventoryRes.data || [];
      const tasks = tasksRes.data || [];
      const constructions = constructionsRes.data || [];

      const totalRevenue = transactions.filter(t => t.type === 'income' || t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const totalInvestments = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
      const totalSales = sales.reduce((s, sa) => s + sa.total_amount, 0);
      const balance = totalRevenue - totalExpenses - totalInvestments;
      const totalSalaries = employees.filter(e => e.status === 'active').reduce((s, e) => s + e.salary, 0);
      const totalRent = properties.filter(p => p.status === 'rented').reduce((s, p) => s + p.monthly_rent, 0);
      const inventoryValue = inventory.reduce((s, i) => s + i.value, 0);
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const activeConstructions = constructions.filter(c => c.status === 'in_progress').length;

      setStats({
        totalRevenue: totalRevenue + totalRent,
        totalExpenses: totalExpenses + totalSalaries,
        totalInvestments,
        balance,
        totalParcelles: parcelles.reduce((s, p) => s + p.area, 0),
        totalAnimals: animals.reduce((s, a) => s + a.count, 0),
        totalEmployees: employees.filter(e => e.status === 'active').length,
        totalProperties: properties.length,
        totalSales,
        pendingTasks,
        activeConstructions,
        inventoryValue,
      });

      // Generate alerts
      const newAlerts: { type: string; message: string; severity: 'high' | 'medium' | 'low' }[] = [];

      // Stock alertses
      inventory.forEach(item => {
        if (item.quantity <= item.min_stock) {
          newAlerts.push({
            type: 'stock',
            message: `Stock bas: ${item.name} (${item.quantity} restant)`,
            severity: 'high',
          });
        }
      });

      // Harvest alerts
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      parcelles.forEach(p => {
        if (p.status === 'recolte_prete' || (p.harvest && new Date(p.harvest) <= in7Days && new Date(p.harvest) >= now)) {
          newAlerts.push({
            type: 'harvest',
            message: `Récolte prévue: ${p.name}`,
            severity: 'medium',
          });
        }
      });

      // Vaccination alerts
      const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      animals.forEach(a => {
        if (a.vaccination && new Date(a.vaccination) <= in14Days && new Date(a.vaccination) >= now) {
          newAlerts.push({
            type: 'vaccination',
            message: `Vaccination à prévoir: ${a.type}`,
            severity: 'medium',
          });
        }
      });

      // Construction alerts
      constructions.forEach(c => {
        if (c.status === 'in_progress' && c.spent > c.budget * 0.8) {
          newAlerts.push({
            type: 'construction',
            message: `Budget presque atteint: ${c.name} (${((c.spent / c.budget) * 100).toFixed(0)}%)`,
            severity: 'high',
          });
        }
      });

      // Pending tasks
      if (pendingTasks > 0) {
        newAlerts.push({
          type: 'task',
          message: `${pendingTasks} tâche(s) en attente`,
          severity: 'low',
        });
      }

      setAlerts(newAlerts);

      // Recent activities from transactions and sales
      const activities: { id: string; type: string; description: string; amount: string; time: string }[] = [];

      transactions.slice(0, 5).forEach(t => {
        const diff = Math.floor((Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60));
        activities.push({
          id: t.description + t.date,
          type: t.type === 'income' ? 'Revenu' : t.type === 'expense' ? 'Dépense' : t.type === 'investment' ? 'Investissement' : 'Transfert',
          description: t.description,
          amount: `${t.amount.toLocaleString('fr-FR')} FCFA`,
          time: diff < 24 ? `${diff}h` : `${Math.floor(diff / 24)}j`,
        });
      });

      sales.slice(0, 3).forEach(s => {
        const diff = Math.floor((Date.now() - new Date(s.sale_date).getTime()) / (1000 * 60 * 60));
        activities.push({
          id: s.product_name + s.sale_date,
          type: 'Vente',
          description: `Vente de ${s.product_name} à ${s.buyer}`,
          amount: `${s.total_amount.toLocaleString('fr-FR')} FCFA`,
          time: diff < 24 ? `${diff}h` : `${Math.floor(diff / 24)}j`,
        });
      });

      setRecentActivities(activities.sort((a, b) => {
        const parseTime = (t: string) => t.endsWith('h') ? parseInt(t) : parseInt(t) * 24;
        return parseTime(a.time) - parseTime(b.time);
      }).slice(0, 6));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Solde Actuel',
      value: `${stats.balance.toLocaleString('fr-FR')} FCFA`,
      icon: DollarSign,
      color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Revenus Totaux',
      value: `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Dépenses du Mois',
      value: `${stats.totalExpenses.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Investissements en Cours',
      value: `${stats.totalInvestments.toLocaleString('fr-FR')} FCFA`,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  const operationalStats = [
    { title: 'Parcelles Cultivées', value: `${stats.totalParcelles} ha`, icon: Wheat, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Têtes de Bétail', value: String(stats.totalAnimals), icon: Cow, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Employés Actifs', value: String(stats.totalEmployees), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Biens Immobiliers', value: String(stats.totalProperties), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Ventes Totales', value: `${stats.totalSales.toLocaleString('fr-FR')} FCFA`, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Valeur Stock', value: `${stats.inventoryValue.toLocaleString('fr-FR')} FCFA`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Tâches en Attente', value: String(stats.pendingTasks), icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Chantiers Actifs', value: String(stats.activeConstructions), icon: HardHat, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertIconColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Financial Indicators */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operational Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {operationalStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className={`p-1.5 rounded-lg ${stat.bg} inline-block mb-2`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Alertes & Rappels</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{alerts.length}</span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className={`flex items-center p-3 border rounded-lg ${getAlertColor(alert.severity)}`}>
                    <AlertTriangle className={`h-4 w-4 ${getAlertIconColor(alert.severity)} mr-3 flex-shrink-0`} />
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.type} • il y a {activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{activity.amount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Synthèse de l'Exploitation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Wheat className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Production agricole</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats.totalParcelles} ha</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Cow className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-gray-700">Cheptel</span>
                  </div>
                  <span className="font-semibold text-orange-600">{stats.totalAnimals} têtes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">Patrimoine immobilier</span>
                  </div>
                  <span className="font-semibold text-purple-600">{stats.totalProperties} biens</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <HardHat className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Chantiers en cours</span>
                  </div>
                  <span className="font-semibold text-blue-600">{stats.activeConstructions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-gray-700">Valeur des stocks</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{stats.inventoryValue.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
