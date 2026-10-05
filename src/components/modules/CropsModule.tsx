import React, { useState } from 'react';
import { Plus, MapPin, Calendar, TrendingUp, AlertCircle, Edit, Trash2, Brain } from 'lucide-react';
import ParcelleForm from '../forms/ParcelleForm';
import SmartCalendarModule from './SmartCalendarModule';
import { supabase } from '../../hooks/useSupabase';
import { Parcelle } from '../../types';

const CropsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('parcelles');
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState<Parcelle | undefined>();
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  React.useEffect(() => {
    loadParcelles();
  }, []);

  const loadParcelles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('parcelles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParcelles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des parcelles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (parcelle: Parcelle) => {
    setEditingParcelle(parcelle);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('parcelles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadParcelles();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleFormSuccess = () => {
    loadParcelles();
    setEditingParcelle(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingParcelle(undefined);
  };

  const calendrier = [
    { date: '2024-06-25', task: 'Récolte du riz - Parcelle B2', type: 'harvest' },
    { date: '2024-06-30', task: 'Traitement phytosanitaire - Parcelle A1', type: 'treatment' },
    { date: '2024-07-05', task: 'Irrigation - Parcelle C3', type: 'irrigation' },
    { date: '2024-07-10', task: 'Préparation du sol - Parcelle D4', type: 'preparation' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'croissance': return 'bg-green-100 text-green-800';
      case 'recolte_prete': return 'bg-yellow-100 text-yellow-800';
      case 'semis': return 'bg-blue-100 text-blue-800';
      case 'preparation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'croissance': return 'En croissance';
      case 'recolte_prete': return 'Récolte prête';
      case 'semis': return 'Semis';
      case 'preparation': return 'Préparation';
      case 'recolte': return 'Récolte';
      default: return status;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'harvest': return 'bg-green-100 text-green-800';
      case 'treatment': return 'bg-red-100 text-red-800';
      case 'irrigation': return 'bg-blue-100 text-blue-800';
      case 'preparation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Cultures</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Parcelle
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('parcelles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parcelles'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Parcelles
          </button>
          <button
            onClick={() => setActiveTab('calendrier')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendrier'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendrier Cultural
          </button>
          <button
            onClick={() => setActiveTab('smart-calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'smart-calendar'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className="h-4 w-4 inline mr-1" />
            Calendrier IA
          </button>
          <button
            onClick={() => setActiveTab('rendements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rendements'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rendements
          </button>
        </nav>
      </div>

      {/* Parcelles Tab */}
      {activeTab === 'parcelles' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcelles.map((parcelle) => (
                <div key={parcelle.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{parcelle.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcelle.status)}`}>
                      {getStatusLabel(parcelle.status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {parcelle.area} ha - {parcelle.crop}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Semis: {new Date(parcelle.planted).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Récolte prévue: {new Date(parcelle.harvest).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => handleEdit(parcelle)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(parcelle.id)}
                      className={`flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center ${
                        deleteConfirm === parcelle.id 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {deleteConfirm === parcelle.id ? 'Confirmer' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              ))}
              {parcelles.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Aucune parcelle enregistrée</p>
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="mt-2 text-green-600 hover:text-green-700"
                  >
                    Créer votre première parcelle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calendrier Tab */}
      {activeTab === 'calendrier' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches à venir</h3>
            <div className="space-y-3">
              {calendrier.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{item.task}</p>
                      <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(item.type)}`}>
                    {item.type === 'harvest' ? 'Récolte' : 
                     item.type === 'treatment' ? 'Traitement' :
                     item.type === 'irrigation' ? 'Irrigation' : 'Préparation'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Smart Calendar Tab */}
      {activeTab === 'smart-calendar' && <SmartCalendarModule />}

      {/* Rendements Tab */}
      {activeTab === 'rendements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendements par Culture</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maïs</span>
                  <span className="font-semibold text-green-600">2,450 kg/ha</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Riz</span>
                  <span className="font-semibold text-blue-600">1,850 kg/ha</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Arachide</span>
                  <span className="font-semibold text-yellow-600">1,200 kg/ha</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Soja</span>
                  <span className="font-semibold text-purple-600">980 kg/ha</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Irrigation requise</p>
                    <p className="text-sm text-red-700">Parcelle C3 - Niveau d'humidité bas</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Récolte programmée</p>
                    <p className="text-sm text-yellow-700">Parcelle B2 - Riz prêt dans 3 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ParcelleForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        parcelle={editingParcelle}
      />
    </div>
  );
};

export default CropsModule;