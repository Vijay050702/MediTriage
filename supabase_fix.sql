-- Complete fix for RLS and profile creation

-- Drop existing policies on profiles that might block insert
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all doctors" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all drivers" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can be viewed by authenticated users" ON public.profiles;

-- Create fresh policies
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_doctors" ON public.profiles
    FOR SELECT USING (role = 'doctor');

CREATE POLICY "profiles_select_drivers" ON public.profiles
    FOR SELECT USING (role = 'driver');

-- Ensure the trigger function exists and works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add consultation_type column to appointments table
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS consultation_type TEXT DEFAULT 'offline' 
    CHECK (consultation_type IN ('online', 'offline'));
