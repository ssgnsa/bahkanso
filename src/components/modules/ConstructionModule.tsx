import React, { useState, useEffect } from 'react';
import { Plus, HardHat, X, Loader2, Edit, Trash2, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';
import { Construction } from '../../types';

const ConstructionModule: React.FC = () => {
  const [constructions, setConstructions] = useState<Construction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Construction | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'planning' as Construction['status'],
    budget: '',
    spent: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    progress: '0',
  });

  useEffect(() => {
    loadConstructions();
  }, []);

  const loadConstructions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('constructions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConstructions(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', status: 'planning', budget: '', spent: '', start_date: new Date().toISOString().split('T')[0], end_date: '', progress: '0' });
    setEditingItem(undefined);
  };

  const handleEdit = (item: Construction) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      status: item.status,
      budget: String(item.budget),
      spent: String(item.spent),
      start_date: item.start_date.split('T')[0],
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      progress: String(item.progress),
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

      const payload = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        budget: parseFloat(formData.budget) || 0,
        spent: parseFloat(formData.spent) || 0,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        progress: parseInt(formData.progress) || 0,
        user_id: user.id,
      };

      let result;
      if (editingItem) {
        result = await supabase.from('constructions').update(payload).eq('id', editingItem.id);
      } else {
        result = await supabase.from('constructions').insert([payload]);
      }

      if (result.error) throw result.error;

      resetForm();
      setIsFormOpen(false);
      loadConstructions();
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
      const { error } = await supabase.from('constructions').delete().eq('id', id);
      if (error) throw error;
      loadConstructions();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const totalBudget = constructions.reduce((s, c) => s + c.budget, 0);
  const totalSpent = constructions.reduce((s, c) => s + c.spent, 0);
  const inProgressCount = constructions.filter(c => c.status === 'in_progress').length;
  const completedCount = constructions.filter(c => c.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planification';
      case 'in_progress': return 'En cours';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'paused': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Chantiers</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Chantier
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget total</p>
              <p className="text-2xl font-bold text-blue-600">{totalBudget.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dépensé</p>
              <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
            </div>
            <HardHat className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Construction Cards */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {constructions.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(c.status)}
                  <h3 className="text-lg font-semibold text-gray-900 ml-2">{c.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                  {getStatusLabel(c.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {c.type}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget: <span className="font-medium text-blue-600">{c.budget.toLocaleString('fr-FR')} FCFA</span></span>
                  <span className="text-gray-600">Dépensé: <span className="font-medium text-red-600">{c.spent.toLocaleString('fr-FR')} FCFA</span></span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Début: {new Date(c.start_date).toLocaleDateString('fr-FR')}</span>
                  {c.end_date && <span>Fin: {new Date(c.end_date).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium text-gray-900">{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${c.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${c.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget usage */}
              {c.budget > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Utilisation du budget</span>
                    <span className={`text-sm font-medium ${c.spent > c.budget ? 'text-red-600' : 'text-gray-900'}`}>
                      {((c.spent / c.budget) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${c.spent > c.budget ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(100, (c.spent / c.budget) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className={`flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center ${
                    deleteConfirm === c.id ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {deleteConfirm === c.id ? 'Confirmer' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
          {constructions.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Aucun chantier enregistré</p>
            </div>
          )}
        </div>
      )}

      {/* Construction Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingItem ? 'Modifier le chantier' : 'Nouveau Chantier'}</h3>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du chantier</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Construction forage, Hangar..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de travaux</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Forage, Construction, Clôture..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Construction['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="planning">Planification</option>
                  <option value="in_progress">En cours</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (FCFA)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dépensé (FCFA)</label>
                  <input
                    type="number"
                    value={formData.spent}
                    onChange={e => setFormData({ ...formData, spent: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progression: {formData.progress}%</label>
                <input
                  type="range"
                  value={formData.progress}
                  onChange={e => setFormData({ ...formData, progress: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full"
                />
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
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingItem ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionModule;
