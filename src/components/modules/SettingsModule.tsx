import React, { useState, useEffect } from 'react';
import { Settings, User, Mail, Save, Loader2, Bell, Globe, Shield } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';

const SettingsModule: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile({ full_name: data?.full_name || '' });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: profile.full_name });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <Settings className="h-6 w-6 text-gray-400" />
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Profil</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={e => setProfile({ full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-600 text-sm">Profil mis à jour avec succès</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Notifications</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Alertes de stock bas</p>
              <p className="text-xs text-gray-500">Recevoir une notification quand le stock atteint le minimum</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 text-green-600 rounded" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Rappels de vaccination</p>
              <p className="text-xs text-gray-500">Notifications pour les vaccinations du bétail</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 text-green-600 rounded" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Dates de récolte</p>
              <p className="text-xs text-gray-500">Rappels pour les récoltes prévues</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 text-green-600 rounded" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Rapport mensuel</p>
              <p className="text-xs text-gray-500">Résumé mensuel des activités par email</p>
            </div>
            <input type="checkbox" className="h-5 w-5 text-green-600 rounded" />
          </label>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Globe className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Paramètres régionaux</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="FCFA">FCFA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Sécurité</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Changer le mot de passe</p>
              <p className="text-xs text-gray-500">Mettez à jour votre mot de passe régulièrement</p>
            </div>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Modifier
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Sessions actives</p>
              <p className="text-xs text-gray-500">Gérez vos appareils connectés</p>
            </div>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Voir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
