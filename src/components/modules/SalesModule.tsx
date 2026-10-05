import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, TrendingUp, X, Loader2, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';
import { Sale } from '../../types';

const SalesModule: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    quantity: '',
    unit: 'kg',
    unit_price: '',
    buyer: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_status: 'paid' as Sale['payment_status'],
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '', quantity: '', unit: 'kg', unit_price: '',
      buyer: '', sale_date: new Date().toISOString().split('T')[0], payment_status: 'paid',
    });
    setEditingSale(undefined);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      product_name: sale.product_name,
      quantity: String(sale.quantity),
      unit: sale.unit,
      unit_price: String(sale.unit_price),
      buyer: sale.buyer,
      sale_date: sale.sale_date.split('T')[0],
      payment_status: sale.payment_status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const qty = parseFloat(formData.quantity);
      const price = parseFloat(formData.unit_price);
      const total = qty * price;

      const payload = {
        product_name: formData.product_name,
        quantity: qty,
        unit: formData.unit,
        unit_price: price,
        total_amount: total,
        buyer: formData.buyer,
        sale_date: new Date(formData.sale_date).toISOString(),
        payment_status: formData.payment_status,
        user_id: user.id,
      };

      let result;
      if (editingSale) {
        result = await supabase.from('sales').update(payload).eq('id', editingSale.id);
      } else {
        result = await supabase.from('sales').insert([payload]);
      }

      if (result.error) throw result.error;

      resetForm();
      setIsFormOpen(false);
      loadSales();
    } catch (error: any) {
      setSubmitError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      loadSales();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const totalRevenue = sales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0);
  const pendingRevenue = sales.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + s.total_amount, 0);
  const partialRevenue = sales.filter(s => s.payment_status === 'partial').reduce((sum, s) => sum + s.total_amount, 0);
  const totalSales = sales.length;

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'partial': return 'Partiel';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Vente
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus encaissés</p>
              <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paiements en attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paiements partiels</p>
              <p className="text-2xl font-bold text-orange-600">{partialRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nombre de ventes</p>
              <p className="text-2xl font-bold text-blue-600">{totalSales}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acheteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sale.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.quantity} {sale.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.unit_price.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{sale.total_amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.buyer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentIcon(sale.payment_status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(sale.payment_status)}`}>
                        {getPaymentLabel(sale.payment_status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(sale)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className={`${deleteConfirm === sale.id ? 'text-red-600' : 'text-gray-400'} hover:text-red-600`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune vente enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sale Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingSale ? 'Modifier la vente' : 'Nouvelle Vente'}</h3>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Maïs, Riz, Bovins..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="sacs">sacs</option>
                    <option value="litres">litres</option>
                    <option value="tonnes">tonnes</option>
                    <option value="unites">unités</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (FCFA)</label>
                <input
                  type="number"
                  value={formData.unit_price}
                  onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-green-600">
                    {(parseFloat(formData.quantity || '0') * parseFloat(formData.unit_price || '0')).toLocaleString('fr-FR')} FCFA
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acheteur</label>
                <input
                  type="text"
                  value={formData.buyer}
                  onChange={e => setFormData({ ...formData, buyer: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nom de l'acheteur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de vente</label>
                <input
                  type="date"
                  value={formData.sale_date}
                  onChange={e => setFormData({ ...formData, sale_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut du paiement</label>
                <select
                  value={formData.payment_status}
                  onChange={e => setFormData({ ...formData, payment_status: e.target.value as Sale['payment_status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="paid">Payé</option>
                  <option value="pending">En attente</option>
                  <option value="partial">Partiel</option>
                </select>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); resetForm(); }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingSale ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
