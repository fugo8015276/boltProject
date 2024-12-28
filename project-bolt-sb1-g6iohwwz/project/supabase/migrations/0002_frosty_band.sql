/*
  # Fix subscriptions RLS policy

  1. Changes
    - Remove recursive policy for subscriptions table
    - Simplify the policy to only check user_id
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

-- Create new simplified policy
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);