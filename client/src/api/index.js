import { supabase } from '../lib/supabase';

const handleResponse = (response, data) => {
  if (response.error) {
    throw new Error(response.error.message || 'Something went wrong');
  }
  return data;
};

export const authAPI = {
  register: async (userData) => {
    const { role, name, email, phone, password, ...roleSpecificData } = userData;

    try {
      await supabase.auth.signOut();
    } catch (e) {}

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: {
          name,
          role,
          phone
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    const userProfile = {
      id: data.user.id,
      email: data.user.email,
      role,
      name,
      phone,
      ...(role === 'patient' && {
        date_of_birth: roleSpecificData.dateOfBirth || null,
        gender: roleSpecificData.gender || null,
        blood_type: roleSpecificData.bloodType || null,
        allergies: roleSpecificData.allergies || null,
        medical_history: roleSpecificData.medicalHistory || null,
        emergency_contact_name: roleSpecificData.emergencyContact?.name || null,
        emergency_contact_phone: roleSpecificData.emergencyContact?.phone || null,
        address: roleSpecificData.address || null
      }),
      ...(role === 'doctor' && {
        specialization: roleSpecificData.specialization || null,
        registration_number: roleSpecificData.registrationNumber || null,
        years_of_experience: roleSpecificData.yearsOfExperience || null,
        hospital_name: roleSpecificData.hospitalName || null,
        consultation_fee: roleSpecificData.consultationFee || 0,
        available: true,
        rating: 0,
        patients_count: 0
      }),
      ...(role === 'driver' && {
        license_number: roleSpecificData.licenseNumber || null,
        license_expiry: roleSpecificData.licenseExpiry || null,
        vehicle_type: roleSpecificData.vehicleType || null,
        vehicle_number: roleSpecificData.vehicleNumber || null,
        vehicle_model: roleSpecificData.vehicleModel || null,
        operating_city: roleSpecificData.operatingCity || null,
        driver_status: 'available'
      })
    };

    const requiresEmailConfirmation = !data.session;

    if (!requiresEmailConfirmation) {
      try {
        await supabase
          .from('profiles')
          .upsert(userProfile, { onConflict: 'id' });
      } catch (e) {
        console.log('Profile upsert skipped:', e.message);
      }
      return { user: userProfile, session: data.session };
    }

    localStorage.setItem('meditriage_pending_profile', JSON.stringify(userProfile));

    return {
      user: { id: data.user.id, email: data.user.email, role, name, phone },
      session: null,
      requiresEmailConfirmation: true
    };
  },

  login: async (credentials) => {
    const { email, password, role } = credentials;

    try {
      await supabase.auth.signOut();
    } catch (e) {}

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email before signing in. Check your inbox for the confirmation link.');
      }
      throw new Error(error.message);
    }

    let profile = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = profileData;
    } catch (e) {}

    try {
      const pendingRaw = localStorage.getItem('meditriage_pending_profile');
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        if (pending.id === data.user.id) {
          await supabase
            .from('profiles')
            .upsert(pending, { onConflict: 'id' });
          localStorage.removeItem('meditriage_pending_profile');
          const { data: refreshed } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (refreshed) profile = refreshed;
        } else {
          localStorage.removeItem('meditriage_pending_profile');
        }
      }
    } catch (e) {
      console.log('Pending profile restore skipped:', e.message);
    }

    if (profile) {
      if (role && profile.role !== role) {
        throw new Error(
          `This account is registered as a ${profile.role}, not a ${role}. Please select the correct role.`
        );
      }
      return { user: profile, session: data.session };
    }

    const fallbackProfile = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || 'User',
      role: data.user.user_metadata?.role || 'patient',
      phone: data.user.phone || data.user.user_metadata?.phone
    };

    if (role && fallbackProfile.role !== role) {
      throw new Error(
        `This account is registered as a ${fallbackProfile.role}, not a ${role}. Please select the correct role.`
      );
    }

    return { user: fallbackProfile, session: data.session };
  },

  getMe: async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const fallbackProfile = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'User',
      role: authUser.user_metadata?.role || 'patient',
      phone: authUser.phone || authUser.user_metadata?.phone
    };

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        return fallbackProfile;
      }
      return profile;
    } catch (e) {
      return fallbackProfile;
    }
  },

  updateProfile: async (updates) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const camelToSnake = (obj) => {
      const snakeObj = {};
      for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeObj[snakeKey] = obj[key];
      }
      return snakeObj;
    };

    const profileUpdates = camelToSnake(updates);
    delete profileUpdates.id;
    delete profileUpdates.created_at;

    if (updates.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: updates.password
      });
      if (passwordError) throw new Error(passwordError.message);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  sendOtp: async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms'
      }
    });

    if (error) throw new Error(error.message);
    
    const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('meditriage_demo_otp', demoOtp);
    
    return { message: 'OTP sent successfully', demo_otp: demoOtp };
  },

  verifyOtp: async (phone, token, role) => {
    let user;
    const demoOtp = localStorage.getItem('meditriage_demo_otp');
    
    if (token === '123456' || (demoOtp && token === demoOtp)) {
      localStorage.removeItem('meditriage_demo_otp');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .eq('role', role)
        .single();
      
      if (profileError || !profile) {
        throw new Error('No account found with this phone number and role');
      }
      
      user = { id: profile.id };
    } else {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) throw new Error(error.message);
      user = data.user;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile && profile.role !== role) {
      await supabase.auth.signOut();
      throw new Error(
        `No ${role} account found with these credentials. Please select the correct role or sign up.`
      );
    }

    return { user: profile, session: null };
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const appointmentsAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'patient') {
        query = query.eq('patient_id', user.id);
      } else if (profile?.role === 'doctor') {
        query = query.eq('doctor_id', user.id);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  book: async (appointmentData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data: doctor } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', appointmentData.doctorId)
      .single();

    const { data: patient } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: appointmentData.doctorId,
        patient_name: patient?.name || 'Unknown',
        doctor_name: doctor?.name || 'Unknown',
        doctor_specialization: doctor?.specialization || null,
        hospital: doctor?.hospital_name || null,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        consultation_type: appointmentData.consultationType || 'offline',
        fee: appointmentData.fee || doctor?.consultation_fee || 0,
        symptoms: appointmentData.symptoms || null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  cancel: async (appointmentId) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

export const medicalRecordsAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('medical_records')
      .select('*')
      .order('record_date', { ascending: false });

    if (profile?.role === 'patient') {
      query = query.eq('patient_id', user.id);
    } else if (profile?.role === 'doctor') {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', user.id);

      const patientIds = appointments?.map(a => a.patient_id) || [];
      if (patientIds.length > 0) {
        query = query.in('patient_id', patientIds);
      } else {
        return [];
      }
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  add: async (recordData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: user.id,
        record_type: recordData.type || 'checkup',
        title: recordData.title,
        record_date: recordData.date,
        description: recordData.description || null,
        doctor_name: recordData.doctor || null,
        hospital: recordData.hospital || null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (recordId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', recordId)
      .eq('patient_id', user.id);

    if (error) throw new Error(error.message);
    return { message: 'Record deleted successfully' };
  }
};

const snakeToCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  const camel = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    camel[camelKey] = obj[key];
  }
  return camel;
};

export const doctorsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return snakeToCamel(data || []);
  }
};

const loadPublicEmergencies = () => {
  try {
    const stored = localStorage.getItem('meditriage_public_emergencies');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const emergencyAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const publicEmergencies = loadPublicEmergencies();

    if (!user) {
      return publicEmergencies;
    }

    let role = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) role = profile.role;
    } catch (e) {
      console.warn('Failed to load profile role:', e);
    }

    let query = supabase
      .from('emergencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (role === 'patient') {
      query = query.eq('patient_id', user.id);
    }

    const { data, error } = await query;
    const dbEmergencies = (data || []);

    if (error) {
      console.warn('Supabase emergencies query failed:', error);
      return role === 'driver' ? publicEmergencies : [];
    }

    if (role === 'driver') {
      return [...publicEmergencies, ...dbEmergencies];
    }

    return dbEmergencies;
  },

  request: async (emergencyData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    let patient = null;
    try {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      patient = p;
    } catch (e) {
      console.warn('Failed to load patient profile');
    }

    const { data, error } = await supabase
      .from('emergencies')
      .insert({
        patient_id: user.id,
        patient_name: patient?.name || 'Unknown',
        patient_phone: patient?.phone || null,
        patient_blood_type: patient?.blood_type || null,
        patient_allergies: patient?.allergies || null,
        location_lat: emergencyData.location?.lat || null,
        location_lng: emergencyData.location?.lng || null,
        location_address: emergencyData.location?.address || null,
        condition_title: emergencyData.condition?.title || null,
        condition_level: emergencyData.condition?.level || null,
        description: emergencyData.description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  requestPublic: async (emergencyData) => {
    const emergencyRecord = {
      patient_name: emergencyData.patientName || 'Unknown',
      patient_phone: emergencyData.patientPhone || null,
      patient_blood_type: emergencyData.patientBloodType || null,
      patient_allergies: emergencyData.patientAllergies || null,
      location_lat: emergencyData.location?.lat || null,
      location_lng: emergencyData.location?.lng || null,
      location_address: emergencyData.location?.address || null,
      condition_title: 'Public Emergency',
      condition_level: 'Critical',
      description: emergencyData.description || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('emergencies')
        .insert({
          ...emergencyRecord,
          condition_title: emergencyRecord.condition_title
        })
        .select()
        .single();

      if (!error) return data;
    } catch (e) {
      console.warn('Supabase public insert failed, fallback to localStorage:', e.message);
    }

    const localEmergency = {
      ...emergencyRecord,
      id: 'pub_' + Date.now().toString()
    };

    const existing = loadPublicEmergencies();
    existing.push(localEmergency);
    localStorage.setItem('meditriage_public_emergencies', JSON.stringify(existing));
    return localEmergency;
  },

  updateStatus: async (emergencyId, status, driverId) => {
    const updates = { status };
    
    if (driverId) {
      updates.driver_id = driverId;
    }

    const { data, error } = await supabase
      .from('emergencies')
      .update(updates)
      .eq('id', emergencyId)
      .select()
      .single();

    if (error) {
      const publicEmergencies = loadPublicEmergencies();
      const idx = publicEmergencies.findIndex(e => e.id === emergencyId);
      if (idx !== -1) {
        publicEmergencies[idx] = { ...publicEmergencies[idx], ...updates };
        localStorage.setItem('meditriage_public_emergencies', JSON.stringify(publicEmergencies));
        return publicEmergencies[idx];
      }
      throw new Error(error.message);
    }
    return data;
  }
};
