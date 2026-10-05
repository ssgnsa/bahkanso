/*
  # Create parcelles table for crop management

  1. New Tables
    - `parcelles`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of the plot
      - `crop` (text, not null) - Type of crop being grown
      - `area` (numeric, not null) - Area in hectares
      - `status` (text, not null) - Current status of the plot
      - `planted` (timestamptz, not null) - Planting date
      - `harvest` (timestamptz, not null) - Expected harvest date
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `parcelles` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraint for valid status values
    - Foreign key to profiles table
*/

CREATE TABLE IF NOT EXISTS parcelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crop text NOT NULL,
  area numeric NOT NULL CHECK (area > 0),
  status text NOT NULL CHECK (status IN ('preparation', 'semis', 'croissance', 'recolte_prete', 'recolte')),
  planted timestamptz NOT NULL,
  harvest timestamptz NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parcelles ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcelles_user_id_fkey'
  ) THEN
    ALTER TABLE parcelles ADD CONSTRAINT parcelles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create policies for parcelles
CREATE POLICY "Users can read own parcelles"
  ON parcelles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parcelles"
  ON parcelles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parcelles"
  ON parcelles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own parcelles"
  ON parcelles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_parcelles_updated_at'
  ) THEN
    CREATE TRIGGER update_parcelles_updated_at
      BEFORE UPDATE ON parcelles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;