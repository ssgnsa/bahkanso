/*
  # Create movements table for inventory tracking

  1. New Tables
    - `movements`
      - `id` (uuid, primary key)
      - `item_id` (uuid, not null) - Reference to inventory item
      - `item_name` (text, not null) - Item name for reference
      - `type` (text, not null) - Movement type
      - `quantity` (numeric, not null) - Quantity moved
      - `date` (timestamptz, not null) - Movement date
      - `reason` (text, not null) - Reason for movement
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `movements` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraint for valid type values
    - Foreign key to profiles and inventory tables
*/

CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('entree', 'sortie', 'vente')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  date timestamptz NOT NULL,
  reason text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'movements_user_id_fkey'
  ) THEN
    ALTER TABLE movements ADD CONSTRAINT movements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'movements_item_id_fkey'
  ) THEN
    ALTER TABLE movements ADD CONSTRAINT movements_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create policies for movements
CREATE POLICY "Users can read own movements"
  ON movements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movements"
  ON movements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);