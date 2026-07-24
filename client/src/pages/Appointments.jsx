import { useState, useMemo, useEffect } from 'react';
import { Search, Star, Calendar, Check, X, Video, MapPin } from 'lucide-react';
import { doctorsAPI, appointmentsAPI } from '../api';
import { specializations } from '../data/conditions';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('offline');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userAppointments, setUserAppointments] = useState([]);

  const nextWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    nextWeek.push({
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorsAPI.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await appointmentsAPI.getAll();
      setUserAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.hospitalName && doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpec = !selectedSpecialization || doc.specialization === selectedSpecialization;
      return matchesSearch && matchesSpec;
    });
  }, [searchTerm, selectedSpecialization, doctors]);

  const getAvailableSlots = (doctor, date) => {
    if (doctor && doctor.schedule && doctor.schedule[date]) {
      return doctor.schedule[date];
    }
    return ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"];
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      showToast('Please select date and time', 'error');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setIsLoading(true);
    try {
      await appointmentsAPI.book({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        consultationType: consultationType,
        fee: selectedDoctor.consultationFee
      });
      showToast('Appointment booked successfully!', 'success');
      loadAppointments();
      setShowConfirmation(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      showToast(error.message || 'Failed to book appointment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1>Book Appointment</h1>
          <p>Find and book appointments with doctors</p>
        </div>

        {userAppointments.length > 0 && (
          <div className="card" style={{ marginBottom: 24, background: '#F0FDF4', borderColor: '#10B981' }}>
            <h3 style={{ marginBottom: 16 }}>Your Upcoming Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {userAppointments.slice(0, 3).map(apt => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 8 }}>
                  <div>
                    <p style={{ fontWeight: 500 }}>{apt.doctor_name}</p>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.doctor_specialization}</p>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      background: apt.consultation_type === 'online' ? '#EFF6FF' : '#F0FDF4',
                      color: apt.consultation_type === 'online' ? '#2563EB' : '#16A34A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4
                    }}>
                      {apt.consultation_type === 'online' ? <><Video size={12} /> Online</> : <><MapPin size={12} /> In-Clinic</>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 500 }}>{apt.appointment_date}</p>
                      <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.appointment_time}</p>
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#DC2626', color: '#DC2626' }}
                      onClick={async () => {
                        if (window.confirm(`Cancel appointment with ${apt.doctor_name} on ${apt.appointment_date}?`)) {
                          try {
                            await appointmentsAPI.cancel(apt.id);
                            showToast('Appointment cancelled', 'success');
                            loadAppointments();
                          } catch (err) {
                            showToast('Failed to cancel', 'error');
                          }
                        }
                      }}
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors..."
                  style={{ paddingLeft: 40, width: '100%' }}
                />
              </div>
            </div>
            <select 
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              style={{ minWidth: 200, padding: '12px 16px' }}
            >
              <option value="">All Specializations</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 24 }}>
          <div>
            <h3 style={{ marginBottom: 16 }}>Available Doctors ({filteredDoctors.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor.id} 
                  className="doctor-card"
                  style={{ 
                    cursor: 'pointer',
                    border: selectedDoctor?.id === doctor.id ? '2px solid #0D9488' : '1px solid #E2E8F0'
                  }}
                  onClick={() => { setSelectedDoctor(doctor); setSelectedDate(''); setSelectedTime(''); setConsultationType('offline'); }}
                >
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div className="doctor-avatar">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ marginBottom: 4 }}>{doctor.name}</h4>
                          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{doctor.specialization}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${doctor.available ? 'badge-normal' : 'badge-urgent'}`}>
                            {doctor.available ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#64748B', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          {doctor.rating || 'New'}
                        </span>
                        <span>{doctor.yearsOfExperience || '0'} years exp.</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          ₹{doctor.consultationFee || 500}
                        </span>
                      </div>

                      <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: 8 }}>
                        {doctor.hospitalName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: '#64748B' }}>No doctors found matching your criteria</p>
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedDoctor ? (
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Book with {selectedDoctor.name}</h3>
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E2E8F0' }}>
                  <div className="doctor-avatar" style={{ width: 60, height: 60, fontSize: '1.25rem', margin: 0 }}>
                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4>{selectedDoctor.name}</h4>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{selectedDoctor.specialization}</p>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{selectedDoctor.hospitalName}</p>
                  </div>
                </div>

                <h4 style={{ marginBottom: 12 }}>Consultation Type</h4>
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <button
                    onClick={() => setConsultationType('offline')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      border: consultationType === 'offline' ? '2px solid #0D9488' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      background: consultationType === 'offline' ? '#F0FDFA' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <MapPin size={24} color={consultationType === 'offline' ? '#0D9488' : '#64748B'} />
                    <span style={{ fontWeight: 600, color: consultationType === 'offline' ? '#0D9488' : '#1E293B' }}>In-Clinic Visit</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Visit the doctor at clinic</span>
                  </button>
                  <button
                    onClick={() => setConsultationType('online')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      border: consultationType === 'online' ? '2px solid #0D9488' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      background: consultationType === 'online' ? '#F0FDFA' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Video size={24} color={consultationType === 'online' ? '#0D9488' : '#64748B'} />
                    <span style={{ fontWeight: 600, color: consultationType === 'online' ? '#0D9488' : '#1E293B' }}>Online Consultation</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Video call from home</span>
                  </button>
                </div>

                <h4 style={{ marginBottom: 12 }}>Select Date</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {nextWeek.map(date => (
                    <button
                      key={date.value}
                      onClick={() => { setSelectedDate(date.value); setSelectedTime(''); }}
                      style={{
                        padding: '10px 16px',
                        border: selectedDate === date.value ? '2px solid #0D9488' : '1px solid #E2E8F0',
                        borderRadius: 8,
                        background: selectedDate === date.value ? '#0D9488' : 'white',
                        color: selectedDate === date.value ? 'white' : '#1E293B',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <h4 style={{ marginBottom: 12 }}>Select Time</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                      {getAvailableSlots(selectedDoctor, selectedDate).map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {selectedTime && (
                  <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div className="info-row">
                      <span className="info-label">Doctor</span>
                      <span className="info-value">{selectedDoctor.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Specialization</span>
                      <span className="info-value">{selectedDoctor.specialization}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Type</span>
                      <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {consultationType === 'online' ? <Video size={14} /> : <MapPin size={14} />}
                        {consultationType === 'online' ? 'Online (Video Call)' : 'In-Clinic Visit'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date</span>
                      <span className="info-value">{selectedDate}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Time</span>
                      <span className="info-value">{selectedTime}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Consultation Fee</span>
                      <span className="info-value">₹{selectedDoctor.consultationFee || 500}</span>
                    </div>
                    
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: 16 }}
                      onClick={handleBookAppointment}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <Calendar size={64} color="#E2E8F0" style={{ marginBottom: 16 }} />
                <h3 style={{ marginBottom: 8, color: '#64748B' }}>Select a Doctor</h3>
                <p style={{ color: '#94A3B8' }}>
                  Choose a doctor from the list to see available time slots
                </p>
              </div>
            )}
          </div>
        </div>

        {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', 
                  background: '#D1FAE5', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Check size={40} color="#10B981" />
                </div>
                <h2>Confirm Appointment</h2>
              </div>
              
              <div className="booking-summary">
                <div className="info-row">
                  <span className="info-label">Doctor</span>
                  <span className="info-value">{selectedDoctor.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Type</span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {consultationType === 'online' ? <Video size={14} /> : <MapPin size={14} />}
                    {consultationType === 'online' ? 'Online (Video Call)' : 'In-Clinic Visit'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date</span>
                  <span className="info-value">{selectedDate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Time</span>
                  <span className="info-value">{selectedTime}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Fee</span>
                  <span className="info-value">₹{selectedDoctor.consultationFee || 500}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={confirmBooking}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
