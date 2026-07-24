-- Migration: Add missing RLS policies for profiles

-- Drop the conflicting profiles_all policy if it exists
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;

-- Add the missing INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policies to view all doctors and drivers
CREATE POLICY "Users can view all doctors" ON public.profiles
    FOR SELECT USING (role = 'doctor');

CREATE POLICY "Users can view all drivers" ON public.profiles
    FOR SELECT USING (role = 'driver');

-- Migration: Add consultation_type to appointments
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS consultation_type TEXT DEFAULT 'offline' 
    CHECK (consultation_type IN ('online', 'offline'));
