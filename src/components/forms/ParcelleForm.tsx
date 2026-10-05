import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../hooks/useSupabase';
import { Parcelle } from '../../types';

interface ParcelleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parcelle?: Parcelle;
}

const schema = yup.object({
  name: yup.string().required('Le nom de la parcelle est requis'),
  crop: yup.string().required('Le type de culture est requis'),
  area: yup.number().positive('La superficie doit être positive').required('La superficie est requise'),
  status: yup.string().required('Le statut est requis'),
  planted: yup.string().required('La date de plantation est requise'),
  harvest: yup.string().required('La date de récolte prévue est requise'),
});

const ParcelleForm: React.FC<ParcelleFormProps> = ({ isOpen, onClose, onSuccess, parcelle }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: parcelle ? {
      name: parcelle.name,
      crop: parcelle.crop,
      area: parcelle.area,
      status: parcelle.status,
      planted: parcelle.planted.split('T')[0],
      harvest: parcelle.harvest.split('T')[0],
    } : {}
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const parcelleData = {
        ...data,
        user_id: user.id,
        planted: new Date(data.planted).toISOString(),
        harvest: new Date(data.harvest).toISOString(),
      };

      let result;
      if (parcelle) {
        result = await supabase
          .from('parcelles')
          .update(parcelleData)
          .eq('id', parcelle.id);
      } else {
        result = await supabase
          .from('parcelles')
          .insert([parcelleData]);
      }

      if (result.error) throw result.error;

      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {parcelle ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la parcelle
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Parcelle A1"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de culture
            </label>
            <select
              {...register('crop')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner une culture</option>
              <option value="Maïs">Maïs</option>
              <option value="Riz">Riz</option>
              <option value="Arachide">Arachide</option>
              <option value="Soja">Soja</option>
              <option value="Mil">Mil</option>
              <option value="Sorgho">Sorgho</option>
              <option value="Hévéa">Hévéa</option>
              <option value="Palmier à huile">Palmier à huile</option>
              <option value="Tomate">Tomate</option>
              <option value="Piment">Piment</option>
              <option value="Manioc">Manioc</option>
              <option value="Pastèque">Pastèque</option>
              <option value="Aubergine">Aubergine</option>
              <option value="Banane">Banane</option>
            </select>
            {errors.crop && (
              <p className="text-red-500 text-sm mt-1">{errors.crop.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Superficie (hectares)
            </label>
            <input
              {...register('area')}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: 2.5"
            />
            {errors.area && (
              <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner un statut</option>
              <option value="preparation">Préparation</option>
              <option value="semis">Semis</option>
              <option value="croissance">En croissance</option>
              <option value="recolte_prete">Récolte prête</option>
              <option value="recolte">Récolte</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de plantation
            </label>
            <input
              {...register('planted')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.planted && (
              <p className="text-red-500 text-sm mt-1">{errors.planted.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de récolte prévue
            </label>
            <input
              {...register('harvest')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.harvest && (
              <p className="text-red-500 text-sm mt-1">{errors.harvest.message}</p>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {parcelle ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParcelleForm;