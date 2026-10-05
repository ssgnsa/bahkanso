export interface Parcelle {
  id: string;
  name: string;
  crop: string;
  area: number;
  status: 'preparation' | 'semis' | 'croissance' | 'recolte_prete' | 'recolte';
  planted: string;
  harvest: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  type: 'bovins' | 'ovins' | 'caprins' | 'volailles';
  count: number;
  health: 'excellente' | 'bonne' | 'moyenne' | 'mauvaise';
  last_check: string;
  vaccination: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'cereales' | 'intrants' | 'oleagineux' | 'fourrage';
  quantity: number;
  unit: string;
  min_stock: number;
  price: number;
  value: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  item_id: string;
  item_name: string;
  type: 'entree' | 'sortie' | 'vente';
  quantity: number;
  date: string;
  reason: string;
  user_id: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  animal_id: string;
  animal_name: string;
  type: 'vaccination' | 'traitement' | 'consultation';
  date: string;
  veterinarian: string;
  notes: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'harvest' | 'treatment' | 'irrigation' | 'preparation';
  date: string;
  parcelle_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'investment' | 'transfer';
  category: string;
  amount: number;
  description: string;
  date: string;
  receipt_url?: string;
  user_id: string;
  created_at: string;
}

export interface Sale {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  buyer: string;
  sale_date: string;
  payment_status: 'paid' | 'pending' | 'partial';
  user_id: string;
  created_at: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'apartment' | 'house' | 'land' | 'warehouse' | 'other';
  status: 'rented' | 'vacant' | 'maintenance' | 'under_construction';
  address: string;
  monthly_rent: number;
  tenant?: string;
  purchase_price: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  role: string;
  phone: string;
  salary: number;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Construction {
  id: string;
  name: string;
  type: string;
  status: 'planning' | 'in_progress' | 'paused' | 'completed';
  budget: number;
  spent: number;
  start_date: string;
  end_date?: string;
  progress: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConstructionStep {
  id: string;
  construction_id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  cost: number;
  order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}
