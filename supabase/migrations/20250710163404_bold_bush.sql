/*
  # Create animals table for livestock management

  1. New Tables
    - `animals`
      - `id` (uuid, primary key)
      - `type` (text, not null) - Type of animal
      - `count` (integer, not null) - Number of animals
      - `health` (text, not null) - Health status
      - `last_check` (timestamptz, not null) - Last health check date
      - `vaccination` (timestamptz, not null) - Last vaccination date
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `animals` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraints for valid type and health values
    - Foreign key to profiles table
*/

CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('bovins', 'ovins', 'caprins', 'volailles')),
  count integer NOT NULL CHECK (count > 0),
  health text NOT NULL CHECK (health IN ('excellente', 'bonne', 'moyenne', 'mauvaise')),
  last_check timestamptz NOT NULL,
  vaccination timestamptz NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'animals_user_id_fkey'
  ) THEN
    ALTER TABLE animals ADD CONSTRAINT animals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create policies for animals
CREATE POLICY "Users can read own animals"
  ON animals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own animals"
  ON animals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own animals"
  ON animals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own animals"
  ON animals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_animals_updated_at'
  ) THEN
    CREATE TRIGGER update_animals_updated_at
      BEFORE UPDATE ON animals
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;