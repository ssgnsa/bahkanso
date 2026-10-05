import React, { useState } from 'react';
import { Plus, Heart, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const LivestockModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventaire');

  const livestock = [
    { id: 1, type: 'Bovins', count: 45, health: 'Excellente', lastCheck: '2024-06-20', vaccination: '2024-05-15' },
    { id: 2, type: 'Ovins', count: 32, health: 'Bonne', lastCheck: '2024-06-18', vaccination: '2024-05-10' },
    { id: 3, type: 'Caprins', count: 28, health: 'Bonne', lastCheck: '2024-06-22', vaccination: '2024-05-12' },
    { id: 4, type: 'Volailles', count: 150, health: 'Moyenne', lastCheck: '2024-06-19', vaccination: '2024-05-20' },
  ];

  const healthRecords = [
    { id: 1, animal: 'Vache #A23', type: 'Vaccination', date: '2024-06-15', veterinarian: 'Dr. Sow', notes: 'Vaccination antirabique' },
    { id: 2, animal: 'Mouton #B12', type: 'Traitement', date: '2024-06-10', veterinarian: 'Dr. Diallo', notes: 'Traitement vermifuge' },
    { id: 3, animal: 'Chèvre #C05', type: 'Consultation', date: '2024-06-08', veterinarian: 'Dr. Sow', notes: 'Contrôle de routine' },
  ];

  const reproductionData = [
    { id: 1, animal: 'Vache #A15', type: 'Gestation', status: 'Enceinte', dueDate: '2024-08-15', notes: '7 mois' },
    { id: 2, animal: 'Truie #P03', type: 'Mise-bas', status: 'Récente', dueDate: '2024-06-01', notes: '8 porcelets' },
    { id: 3, animal: 'Brebis #B08', type: 'Saillie', status: 'Programmée', dueDate: '2024-07-01', notes: 'Avec bélier #B01' },
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellente': return 'bg-green-100 text-green-800';
      case 'Bonne': return 'bg-blue-100 text-blue-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Mauvaise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enceinte': return 'bg-purple-100 text-purple-800';
      case 'Récente': return 'bg-green-100 text-green-800';
      case 'Programmée': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Bétail</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Animal
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('inventaire')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventaire'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inventaire
          </button>
          <button
            onClick={() => setActiveTab('sante')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sante'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Santé
          </button>
          <button
            onClick={() => setActiveTab('reproduction')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reproduction'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reproduction
          </button>
          <button
            onClick={() => setActiveTab('alimentation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alimentation'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Alimentation
          </button>
        </nav>
      </div>

      {/* Inventaire Tab */}
      {activeTab === 'inventaire' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {livestock.map((animal) => (
              <div key={animal.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{animal.type}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(animal.health)}`}>
                    {animal.health}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600 mb-2">{animal.count}</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    Dernier contrôle: {new Date(animal.lastCheck).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Vaccination: {new Date(animal.vaccination).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                    Détails
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Santé Tab */}
      {activeTab === 'sante' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registre Sanitaire</h3>
            <div className="space-y-3">
              {healthRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{record.animal} - {record.type}</p>
                      <p className="text-sm text-gray-500">{record.veterinarian} • {new Date(record.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Sanitaires</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-red-900">Vaccination en retard</p>
                  <p className="text-sm text-red-700">Volailles - Rappel vaccinal dû depuis 5 jours</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-900">Contrôle programmé</p>
                  <p className="text-sm text-yellow-700">Bovins - Visite vétérinaire dans 3 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reproduction Tab */}
      {activeTab === 'reproduction' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivi de la Reproduction</h3>
            <div className="space-y-3">
              {reproductionData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{item.animal} - {item.type}</p>
                      <p className="text-sm text-gray-500">Date prévue: {new Date(item.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alimentation Tab */}
      {activeTab === 'alimentation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stocks d'Aliments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Foin</span>
                  <span className="font-semibold text-green-600">2,500 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Concentré Bovins</span>
                  <span className="font-semibold text-blue-600">800 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Grains Volailles</span>
                  <span className="font-semibold text-yellow-600">450 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sel minéral</span>
                  <span className="font-semibold text-purple-600">125 kg</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coûts d'Alimentation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ce mois</span>
                  <span className="font-semibold text-green-600">285,000 FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Moyenne mensuelle</span>
                  <span className="font-semibold text-blue-600">320,000 FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Coût par tête</span>
                  <span className="font-semibold text-purple-600">1,925 FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestockModule;