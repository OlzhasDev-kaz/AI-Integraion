/*
  # Add api_keys column to profiles table

  1. Changes
    - Add api_keys column to profiles table if it doesn't exist
    - Set default value to empty JSON object
  
  2. Security
    - Column inherits existing RLS policies from profiles table
*/

-- Add api_keys column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'api_keys'
  ) THEN
    ALTER TABLE profiles ADD COLUMN api_keys jsonb DEFAULT '{}';
  END IF;
END $$;