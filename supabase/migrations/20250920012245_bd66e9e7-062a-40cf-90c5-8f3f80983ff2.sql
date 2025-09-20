-- Fix security issue: Restrict court sessions visibility to authenticated users only
-- This prevents anonymous users from tracking player names and activity patterns

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Sessions readable by anyone" ON public.court_sessions;

-- Create a new policy that requires authentication
CREATE POLICY "Sessions readable by authenticated users only" 
ON public.court_sessions 
FOR SELECT 
TO authenticated
USING (true);

-- This change ensures that:
-- 1. Only authenticated users can view court sessions and player names
-- 2. Anonymous visitors cannot track individual player activity patterns
-- 3. The app functionality is preserved for legitimate users
-- 4. Privacy is protected while maintaining necessary visibility for queue management