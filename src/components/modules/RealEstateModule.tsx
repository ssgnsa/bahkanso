import React, { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, X, Loader2, Edit, Trash2, Home, DollarSign } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';
import { Property } from '../../types';

const RealEstateModule: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'apartment' as Property['type'],
    status: 'vacant' as Property['status'],
    address: '',
    monthly_rent: '',
    tenant: '',
    purchase_price: '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'apartment', status: 'vacant', address: '', monthly_rent: '', tenant: '', purchase_price: '' });
    setEditingProperty(undefined);
  };

  const handleEdit = (prop: Property) => {
    setEditingProperty(prop);
    setFormData({
      name: prop.name,
      type: prop.type,
      status: prop.status,
      address: prop.address,
      monthly_rent: String(prop.monthly_rent),
      tenant: prop.tenant || '',
      purchase_price: String(prop.purchase_price),
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
        address: formData.address,
        monthly_rent: parseFloat(formData.monthly_rent) || 0,
        tenant: formData.tenant || null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        user_id: user.id,
      };

      let result;
      if (editingProperty) {
        result = await supabase.from('properties').update(payload).eq('id', editingProperty.id);
      } else {
        result = await supabase.from('properties').insert([payload]);
      }

      if (result.error) throw result.error;

      resetForm();
      setIsFormOpen(false);
      loadProperties();
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
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      loadProperties();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const totalRentIncome = properties.filter(p => p.status === 'rented').reduce((s, p) => s + p.monthly_rent, 0);
  const totalValue = properties.reduce((s, p) => s + p.purchase_price, 0);
  const rentedCount = properties.filter(p => p.status === 'rented').length;
  const vacantCount = properties.filter(p => p.status === 'vacant').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rented': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'under_construction': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rented': return 'Loué';
      case 'vacant': return 'Vacant';
      case 'maintenance': return 'Maintenance';
      case 'under_construction': return 'En construction';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'land': return 'Terrain';
      case 'warehouse': return 'Entrepôt';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion Immobilière</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Bien
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus locatifs/mois</p>
              <p className="text-2xl font-bold text-green-600">{totalRentIncome.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur du patrimoine</p>
              <p className="text-2xl font-bold text-blue-600">{totalValue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Biens loués</p>
              <p className="text-2xl font-bold text-green-600">{rentedCount}</p>
            </div>
            <Home className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Biens vacants</p>
              <p className="text-2xl font-bold text-gray-600">{vacantCount}</p>
            </div>
            <Building2 className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{prop.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prop.status)}`}>
                  {getStatusLabel(prop.status)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  {getTypeLabel(prop.type)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {prop.address}
                </div>
                {prop.tenant && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Home className="h-4 w-4 mr-2" />
                    Locataire: {prop.tenant}
                  </div>
                )}
                <div className="flex items-center text-sm font-medium text-green-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Loyer: {prop.monthly_rent.toLocaleString('fr-FR')} FCFA/mois
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(prop)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(prop.id)}
                  className={`flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center ${
                    deleteConfirm === prop.id ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {deleteConfirm === prop.id ? 'Confirmer' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Aucun bien immobilier enregistré</p>
            </div>
          )}
        </div>
      )}

      {/* Property Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingProperty ? 'Modifier le bien' : 'Nouveau Bien'}</h3>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du bien</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Appartement Centre-ville"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as Property['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="land">Terrain</option>
                    <option value="warehouse">Entrepôt</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="rented">Loué</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="under_construction">En construction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Adresse complète"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loyer mensuel (FCFA)</label>
                  <input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (FCFA)</label>
                  <input
                    type="number"
                    value={formData.purchase_price}
                    onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locataire (optionnel)</label>
                <input
                  type="text"
                  value={formData.tenant}
                  onChange={e => setFormData({ ...formData, tenant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nom du locataire"
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
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingProperty ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateModule;
