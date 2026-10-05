import { createClient } from '@supabase/supabase-js';

// 1. Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Vérification de sécurité au démarrage
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERREUR CRITIQUE : Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont manquantes dans votre fichier .env');
}

// 3. Créer et exporter le VRAI client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook pratique pour l'utiliser dans les composants
export const useSupabase = () => ({ supabase });
