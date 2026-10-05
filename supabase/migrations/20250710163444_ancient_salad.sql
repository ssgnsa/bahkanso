/*
  # Create tasks table for agricultural task management

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Task title
      - `description` (text, not null) - Task description
      - `type` (text, not null) - Task type
      - `date` (timestamptz, not null) - Scheduled date
      - `parcelle_id` (uuid, nullable) - Optional reference to parcelle
      - `status` (text, not null) - Task status
      - `user_id` (uuid, not null) - Reference to profiles table
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users to manage their own data

  3. Constraints
    - Check constraints for valid type and status values
    - Foreign key to profiles and parcelles tables
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('harvest', 'treatment', 'irrigation', 'preparation')),
  date timestamptz NOT NULL,
  parcelle_id uuid,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_user_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_parcelle_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_parcelle_id_fkey 
    FOREIGN KEY (parcelle_id) REFERENCES parcelles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create policies for tasks
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;