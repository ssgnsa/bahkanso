import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Wheat, Cog as Cow, Building2, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';

const AnalyticsModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalSales: 0,
    totalParcelles: 0,
    totalAnimals: 0,
    totalProperties: 0,
    totalInventoryValue: 0,
    monthlyData: [] as { month: string; revenue: number; expenses: number }[],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [salesRes, transactionsRes, parcellesRes, animalsRes, propertiesRes, inventoryRes] = await Promise.all([
        supabase.from('sales').select('total_amount, sale_date').eq('user_id', user.id),
        supabase.from('transactions').select('type, amount, date').eq('user_id', user.id),
        supabase.from('parcelles').select('area').eq('user_id', user.id),
        supabase.from('animals').select('count').eq('user_id', user.id),
        supabase.from('properties').select('monthly_rent, purchase_price').eq('user_id', user.id),
        supabase.from('inventory').select('value').eq('user_id', user.id),
      ]);

      const sales = salesRes.data || [];
      const transactions = transactionsRes.data || [];
      const parcelles = parcellesRes.data || [];
      const animals = animalsRes.data || [];
      const properties = propertiesRes.data || [];
      const inventory = inventoryRes.data || [];

      const totalRevenue = transactions.filter(t => t.type === 'income' || t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense' || t.type === 'investment').reduce((s, t) => s + t.amount, 0);
      const totalSales = sales.reduce((s, sa) => s + sa.total_amount, 0);

      // Monthly data for the last 6 months
      const now = new Date();
      const monthlyData: { month: string; revenue: number; expenses: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });

        const rev = transactions
          .filter(t => {
            const td = new Date(t.date);
            return (t.type === 'income' || t.type === 'transfer') && td >= monthStart && td <= monthEnd;
          })
          .reduce((s, t) => s + t.amount, 0);

        const exp = transactions
          .filter(t => {
            const td = new Date(t.date);
            return (t.type === 'expense' || t.type === 'investment') && td >= monthStart && td <= monthEnd;
          })
          .reduce((s, t) => s + t.amount, 0);

        monthlyData.push({ month: monthName, revenue: rev, expenses: exp });
      }

      setStats({
        totalRevenue,
        totalExpenses,
        totalSales,
        totalParcelles: parcelles.reduce((s, p) => s + p.area, 0),
        totalAnimals: animals.reduce((s, a) => s + a.count, 0),
        totalProperties: properties.length,
        totalInventoryValue: inventory.reduce((s, i) => s + i.value, 0),
        monthlyData,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxMonthly = Math.max(...stats.monthlyData.map(m => Math.max(m.revenue, m.expenses)), 1);
  const profit = stats.totalRevenue - stats.totalExpenses;

  const kpiCards = [
    { title: 'Revenus Totaux', value: `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Dépenses Totales', value: `${stats.totalExpenses.toLocaleString('fr-FR')} FCFA`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Bénéfice Net', value: `${profit.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: profit >= 0 ? 'text-green-600' : 'text-red-600', bg: profit >= 0 ? 'bg-green-50' : 'bg-red-50' },
    { title: 'Ventes Totales', value: `${stats.totalSales.toLocaleString('fr-FR')} FCFA`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Surface Cultivée', value: `${stats.totalParcelles} ha`, icon: Wheat, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Têtes de Bétail', value: String(stats.totalAnimals), icon: Cow, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Biens Immobiliers', value: String(stats.totalProperties), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Valeur Stock', value: `${stats.totalInventoryValue.toLocaleString('fr-FR')} FCFA`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analyses & Rapports</h2>
        <BarChart3 className="h-6 w-6 text-gray-400" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600">{kpi.title}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution Mensuelle (6 derniers mois)</h3>
        <div className="flex items-end justify-between h-64 space-x-2">
          {stats.monthlyData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center space-x-1 items-end h-48">
                <div
                  className="w-1/2 bg-green-500 rounded-t transition-all hover:bg-green-600"
                  style={{ height: `${(data.revenue / maxMonthly) * 100}%`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                  title={`Revenus: ${data.revenue.toLocaleString('fr-FR')} FCFA`}
                ></div>
                <div
                  className="w-1/2 bg-red-400 rounded-t transition-all hover:bg-red-500"
                  style={{ height: `${(data.expenses / maxMonthly) * 100}%`, minHeight: data.expenses > 0 ? '4px' : '0' }}
                  title={`Dépenses: ${data.expenses.toLocaleString('fr-FR')} FCFA`}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 capitalize">{data.month}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Revenus</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Dépenses</span>
          </div>
        </div>
      </div>

      {/* Profitability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse de Rentabilité</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Marge brute</span>
              <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Taux de marge</span>
              <span className="font-bold text-gray-900">
                {stats.totalRevenue > 0 ? ((profit / stats.totalRevenue) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Revenu par hectare</span>
              <span className="font-bold text-green-600">
                {stats.totalParcelles > 0 ? Math.round(stats.totalRevenue / stats.totalParcelles).toLocaleString('fr-FR') : '0'} FCFA/ha
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Revenu par tête de bétail</span>
              <span className="font-bold text-orange-600">
                {stats.totalAnimals > 0 ? Math.round(stats.totalRevenue / stats.totalAnimals).toLocaleString('fr-FR') : '0'} FCFA
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Actifs</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Immobilier</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalProperties} biens</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.totalProperties > 0 ? 25 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Stocks</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalInventoryValue.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${stats.totalInventoryValue > 0 ? 20 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Cultures</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalParcelles} ha</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalParcelles > 0 ? 30 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Bétail</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalAnimals} têtes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats.totalAnimals > 0 ? 25 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;
