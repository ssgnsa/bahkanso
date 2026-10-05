/*
  # Create inventory table for stock management

  1. New Tables
    - `inventory`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Item name
      - `category` (text, not null) - Item category
      - `quantity` (numeric, not null) - Current quantity
      - `unit` (text, not null) - Unit of measurement
      - `min_stock` (numeric, not null) - Minimum stock level
      - `price` (numeric, not null) - Unit price
      - `value` (numeric, not null) - Total value
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `inventory` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraint for valid category values
    - Foreign key to profiles table
*/

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cereales', 'intrants', 'oleagineux', 'fourrage')),
  quantity numeric NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL,
  min_stock numeric NOT NULL CHECK (min_stock >= 0),
  price numeric NOT NULL CHECK (price >= 0),
  value numeric NOT NULL CHECK (value >= 0),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inventory_user_id_fkey'
  ) THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create policies for inventory
CREATE POLICY "Users can read own inventory"
  ON inventory
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON inventory
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_inventory_updated_at'
  ) THEN
    CREATE TRIGGER update_inventory_updated_at
      BEFORE UPDATE ON inventory
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;