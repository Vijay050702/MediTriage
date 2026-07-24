-- MediTriage Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'driver', 'admin')),
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Patient-specific fields
    date_of_birth DATE,
    gender TEXT,
    blood_type TEXT,
    allergies TEXT,
    medical_history TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    
    -- Doctor-specific fields
    specialization TEXT,
    registration_number TEXT,
    years_of_experience INTEGER,
    hospital_name TEXT,
    consultation_fee NUMERIC(10,2) DEFAULT 0,
    available BOOLEAN DEFAULT true,
    rating NUMERIC(3,2) DEFAULT 0,
    patients_count INTEGER DEFAULT 0,
    
    -- Driver-specific fields
    license_number TEXT,
    license_expiry DATE,
    vehicle_type TEXT,
    vehicle_number TEXT,
    vehicle_model TEXT,
    operating_city TEXT,
    driver_status TEXT DEFAULT 'available'
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_specialization TEXT,
    hospital TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_type TEXT DEFAULT 'offline' CHECK (consultation_type IN ('online', 'offline')),
    fee NUMERIC(10,2) DEFAULT 0,
    symptoms TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    record_type TEXT DEFAULT 'checkup',
    title TEXT NOT NULL,
    record_date DATE NOT NULL,
    description TEXT,
    doctor_name TEXT,
    hospital TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergencies table
CREATE TABLE IF NOT EXISTS public.emergencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT,
    patient_phone TEXT,
    patient_blood_type TEXT,
    patient_allergies TEXT,
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),
    location_address TEXT,
    condition_title TEXT,
    condition_level TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'in_progress', 'resolved')),
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_patient ON public.emergencies(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON public.emergencies(status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, doctors can be read by all authenticated users
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all doctors" ON public.profiles
    FOR SELECT USING (role = 'doctor');

CREATE POLICY "Users can view all drivers" ON public.profiles
    FOR SELECT USING (role = 'driver');

CREATE POLICY "Doctors can be viewed by authenticated users" ON public.profiles
    FOR SELECT USING (role = 'doctor' AND auth.role() = 'authenticated');

-- Appointments: Patients see their own, doctors see their appointments
CREATE POLICY "Patients can view their appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can delete their appointments" ON public.appointments
    FOR DELETE USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Medical records: Patients see their own, doctors see their patients' records
CREATE POLICY "Patients can view their records" ON public.medical_records
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their patients' records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE doctor_id = auth.uid() 
            AND patient_id = medical_records.patient_id
        )
    );

CREATE POLICY "Patients can add records" ON public.medical_records
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their records" ON public.medical_records
    FOR DELETE USING (auth.uid() = patient_id);

-- Emergencies: Drivers see all, patients see their own
CREATE POLICY "Drivers can view all emergencies" ON public.emergencies
    FOR SELECT USING (auth.uid() = driver_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver'));

CREATE POLICY "Patients can view their emergencies" ON public.emergencies
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create emergencies" ON public.medical_records
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Drivers can update emergencies" ON public.emergencies
    FOR UPDATE USING (auth.uid() = driver_id);

-- Function to automatically create profile on user signup
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

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_emergencies_updated_at BEFORE UPDATE ON public.emergencies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
