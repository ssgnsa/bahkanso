import React, { useState, useEffect } from 'react';
import { Calendar, Satellite, Brain, CloudRain, Thermometer, Droplets, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  pressure: number;
}

interface SatelliteData {
  ndvi: number;
  soilMoisture: number;
  cloudCover: number;
  lastUpdate: string;
}

interface AIRecommendation {
  crop: string;
  confidence: number;
  optimalPlantingDate: string;
  expectedHarvest: string;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

interface CropCalendar {
  crop: string;
  plantingPeriod: { start: string; end: string };
  harvestPeriod: { start: string; end: string };
  duration: number; // en jours
  waterRequirement: 'low' | 'medium' | 'high';
  soilType: string[];
}

const SmartCalendarModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');

  // Calendrier cultural spécifique à Sikensi, Agnéby-Tiassa
  const cropCalendars: CropCalendar[] = [
    {
      crop: 'Cacao',
      plantingPeriod: { start: 'Mars', end: 'Mai' },
      harvestPeriod: { start: 'Octobre', end: 'Février' },
      duration: 180,
      waterRequirement: 'high',
      soilType: ['Ferralsol', 'Acrisol']
    },
    {
      crop: 'Palmier à huile',
      plantingPeriod: { start: 'Avril', end: 'Juin' },
      harvestPeriod: { start: 'Toute l\'année', end: 'Toute l\'année' },
      duration: 365,
      waterRequirement: 'high',
      soilType: ['Ferralsol', 'Gleysol']
    },
    {
      crop: 'Hévéa',
      plantingPeriod: { start: 'Mars', end: 'Mai' },
      harvestPeriod: { start: 'Toute l\'année', end: 'Toute l\'année' },
      duration: 365,
      waterRequirement: 'medium',
      soilType: ['Ferralsol', 'Acrisol']
    },
    {
      crop: 'Manioc',
      plantingPeriod: { start: 'Mars', end: 'Juillet' },
      harvestPeriod: { start: 'Décembre', end: 'Février' },
      duration: 300,
      waterRequirement: 'low',
      soilType: ['Ferralsol', 'Acrisol', 'Lixisol']
    },
    {
      crop: 'Banane',
      plantingPeriod: { start: 'Mars', end: 'Mai' },
      harvestPeriod: { start: 'Toute l\'année', end: 'Toute l\'année' },
      duration: 365,
      waterRequirement: 'high',
      soilType: ['Ferralsol', 'Fluvisol']
    },
    {
      crop: 'Tomate',
      plantingPeriod: { start: 'Octobre', end: 'Février' },
      harvestPeriod: { start: 'Décembre', end: 'Avril' },
      duration: 90,
      waterRequirement: 'medium',
      soilType: ['Ferralsol', 'Fluvisol']
    },
    {
      crop: 'Piment',
      plantingPeriod: { start: 'Octobre', end: 'Février' },
      harvestPeriod: { start: 'Janvier', end: 'Mai' },
      duration: 120,
      waterRequirement: 'medium',
      soilType: ['Ferralsol', 'Acrisol']
    },
    {
      crop: 'Aubergine',
      plantingPeriod: { start: 'Septembre', end: 'Février' },
      harvestPeriod: { start: 'Décembre', end: 'Mai' },
      duration: 100,
      waterRequirement: 'medium',
      soilType: ['Ferralsol', 'Fluvisol']
    }
  ];

  useEffect(() => {
    loadWeatherData();
    loadSatelliteData();
    generateAIRecommendations();
  }, []);

  const loadWeatherData = async () => {
    // Simulation des données météo pour Sikensi
    // En production, utiliser une API météo réelle comme OpenWeatherMap
    setWeatherData({
      temperature: 28.5,
      humidity: 78,
      rainfall: 145.2,
      windSpeed: 12.3,
      pressure: 1013.2
    });
  };

  const loadSatelliteData = async () => {
    // Simulation des données satellite
    // En production, utiliser des APIs comme Sentinel Hub, NASA MODIS, etc.
    setSatelliteData({
      ndvi: 0.72,
      soilMoisture: 0.35,
      cloudCover: 45,
      lastUpdate: new Date().toISOString()
    });
  };

  const generateAIRecommendations = async () => {
    setLoading(true);
    
    // Simulation de l'IA - En production, utiliser un modèle ML réel
    const recommendations: AIRecommendation[] = [
      {
        crop: 'Tomate',
        confidence: 92,
        optimalPlantingDate: '2024-11-15',
        expectedHarvest: '2024-02-15',
        riskLevel: 'low',
        reasons: [
          'Saison sèche favorable',
          'Humidité du sol optimale (35%)',
          'Température idéale (28°C)',
          'NDVI indique une bonne santé des sols'
        ]
      },
      {
        crop: 'Piment',
        confidence: 88,
        optimalPlantingDate: '2024-12-01',
        expectedHarvest: '2024-04-01',
        riskLevel: 'low',
        reasons: [
          'Conditions climatiques stables',
          'Faible risque de maladies',
          'Demande du marché élevée'
        ]
      },
      {
        crop: 'Palmier à huile',
        confidence: 75,
        optimalPlantingDate: '2024-04-15',
        expectedHarvest: '2025-04-15',
        riskLevel: 'medium',
        reasons: [
          'Investissement à long terme',
          'Sol ferralsol adapté',
          'Pluviométrie suffisante'
        ]
      }
    ];

    setAiRecommendations(recommendations);
    setLoading(false);
  };

  const getSeasonInfo = () => {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 10 || currentMonth <= 2) {
      return {
        season: 'Saison sèche',
        description: 'Période idéale pour les cultures maraîchères',
        color: 'text-orange-600 bg-orange-100'
      };
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      return {
        season: 'Petite saison des pluies',
        description: 'Plantation des cultures pérennes',
        color: 'text-blue-600 bg-blue-100'
      };
    } else {
      return {
        season: 'Grande saison des pluies',
        description: 'Croissance active des cultures',
        color: 'text-green-600 bg-green-100'
      };
    }
  };

  const seasonInfo = getSeasonInfo();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendrier Cultural Intelligent</h2>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            Sikensi, Agnéby-Tiassa, Côte d'Ivoire
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg ${seasonInfo.color}`}>
          <p className="font-semibold">{seasonInfo.season}</p>
          <p className="text-xs">{seasonInfo.description}</p>
        </div>
      </div>

      {/* Données en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Température</p>
              <p className="text-2xl font-bold text-orange-600">{weatherData?.temperature}°C</p>
            </div>
            <Thermometer className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Humidité</p>
              <p className="text-2xl font-bold text-blue-600">{weatherData?.humidity}%</p>
            </div>
            <Droplets className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">NDVI Satellite</p>
              <p className="text-2xl font-bold text-green-600">{satelliteData?.ndvi}</p>
            </div>
            <Satellite className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pluviométrie</p>
              <p className="text-2xl font-bold text-purple-600">{weatherData?.rainfall}mm</p>
            </div>
            <CloudRain className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Calendrier
          </button>
          <button
            onClick={() => setActiveTab('ai-recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai-recommendations'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            Recommandations IA
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'satellite'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Satellite className="h-4 w-4 inline mr-2" />
            Données Satellite
          </button>
        </nav>
      </div>

      {/* Calendrier Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendrier Cultural - Région Sikensi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropCalendars.map((crop, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">{crop.crop}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-2" />
                      <span>Plantation: {crop.plantingPeriod.start} - {crop.plantingPeriod.end}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                      <span>Récolte: {crop.harvestPeriod.start} - {crop.harvestPeriod.end}</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                      <span>Eau: {crop.waterRequirement === 'high' ? 'Élevé' : crop.waterRequirement === 'medium' ? 'Moyen' : 'Faible'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-600 mr-2" />
                      <span>Durée: {crop.duration} jours</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommandations IA Tab */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recommandations IA</h3>
              <button 
                onClick={generateAIRecommendations}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Brain className="h-4 w-4 mr-2" />
                {loading ? 'Analyse...' : 'Actualiser'}
              </button>
            </div>
            
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{rec.crop}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        rec.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Risque {rec.riskLevel === 'low' ? 'faible' : rec.riskLevel === 'medium' ? 'moyen' : 'élevé'}
                      </span>
                      <span className="text-sm font-medium text-green-600">{rec.confidence}% confiance</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Date optimale de plantation</p>
                      <p className="font-medium">{new Date(rec.optimalPlantingDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Récolte prévue</p>
                      <p className="font-medium">{new Date(rec.expectedHarvest).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Raisons de la recommandation:</p>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Données Satellite Tab */}
      {activeTab === 'satellite' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Indices de Végétation</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">NDVI (Santé végétation)</span>
                    <span className="font-semibold text-green-600">{satelliteData?.ndvi}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(satelliteData?.ndvi || 0) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Excellent (0.7-1.0)</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Humidité du sol</span>
                    <span className="font-semibold text-blue-600">{((satelliteData?.soilMoisture || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(satelliteData?.soilMoisture || 0) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Optimal pour plantation</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conditions Météorologiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Couverture nuageuse</span>
                  <span className="font-semibold">{satelliteData?.cloudCover}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pression atmosphérique</span>
                  <span className="font-semibold">{weatherData?.pressure} hPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vitesse du vent</span>
                  <span className="font-semibold">{weatherData?.windSpeed} km/h</span>
                </div>
                <div className="text-xs text-gray-500">
                  Dernière mise à jour: {satelliteData ? new Date(satelliteData.lastUpdate).toLocaleString('fr-FR') : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Satellite</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Conditions optimales détectées</p>
                  <p className="text-sm text-green-700">NDVI élevé indique une bonne santé des sols pour nouvelles plantations</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Humidité du sol favorable</p>
                  <p className="text-sm text-blue-700">Niveau d'humidité optimal pour la germination des graines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCalendarModule;