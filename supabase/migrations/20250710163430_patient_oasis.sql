/*
  # Create health_records table for animal health tracking

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key)
      - `animal_id` (uuid, not null) - Reference to animal
      - `animal_name` (text, not null) - Animal name for reference
      - `type` (text, not null) - Record type
      - `date` (timestamptz, not null) - Record date
      - `veterinarian` (text, not null) - Veterinarian name
      - `notes` (text, not null) - Additional notes
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `health_records` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraint for valid type values
    - Foreign key to profiles and animals tables
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL,
  animal_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('vaccination', 'traitement', 'consultation')),
  date timestamptz NOT NULL,
  veterinarian text NOT NULL,
  notes text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'health_records_user_id_fkey'
  ) THEN
    ALTER TABLE health_records ADD CONSTRAINT health_records_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'health_records_animal_id_fkey'
  ) THEN
    ALTER TABLE health_records ADD CONSTRAINT health_records_animal_id_fkey 
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create policies for health_records
CREATE POLICY "Users can read own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);