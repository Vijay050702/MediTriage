import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, FileText, Activity, Heart, AlertTriangle } from 'lucide-react';
import { appointmentsAPI, medicalRecordsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const Patients = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsAPI.getAll();
      setAppointments(data);
      
      const uniquePatients = {};
      data.forEach(apt => {
        if (!uniquePatients[apt.patient_id]) {
          uniquePatients[apt.patient_id] = {
            id: apt.patient_id,
            name: apt.patient_name,
            email: '',
            phone: '',
            lastVisit: apt.appointment_date,
            condition: apt.symptoms || 'Consultation',
            appointments: []
          };
        }
        uniquePatients[apt.patient_id].appointments.push(apt);
      });
      setPatientsMap(uniquePatients);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const patients = Object.values(patientsMap);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1>My Patients</h1>
          <p>Manage your patient records and medical history</p>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
                placeholder="Search patients by name, email, or phone..."
                style={{ paddingLeft: 40, width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 24 }}>
          <div>
            <h3 style={{ marginBottom: 16 }}>Patient List ({filteredPatients.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredPatients.map(patient => (
                <div 
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="card"
                  style={{ 
                    cursor: 'pointer',
                    border: selectedPatient?.id === patient.id ? '2px solid #0D9488' : '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div className="avatar" style={{ background: '#0D9488' }}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: 4 }}>{patient.name}</h4>
                      <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{patient.condition}</p>
                      <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Last visit: {patient.lastVisit}</p>
                    </div>
                    <span className={`badge ${patient.condition.includes('Follow') || patient.condition.includes('Review') ? 'badge-urgent' : 'badge-normal'}`}>
                      {patient.condition.includes('Follow') || patient.condition.includes('Review') ? 'Review' : 'New'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedPatient ? (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h2>{selectedPatient.name}</h2>
                    <p style={{ color: '#64748B' }}>Patient ID: {selectedPatient.id.slice(0, 8)}</p>
                  </div>
                  <span className="badge badge-normal">{selectedPatient.appointments?.length || 0} Visits</span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ marginBottom: 12 }}>Appointment History</h4>
                  {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8 }}>
                      {selectedPatient.appointments.map((apt, index) => (
                        <div key={apt.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: index < selectedPatient.appointments.length - 1 ? '1px solid #E2E8F0' : 'none'
                        }}>
                          <div>
                            <p style={{ fontWeight: 500 }}>{apt.doctor_name}</p>
                            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.doctor_specialization} • {apt.hospital}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 500 }}>{apt.appointment_date}</p>
                            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.appointment_time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#64748B' }}>No appointment history</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }}>
                    <Calendar size={16} />
                    Schedule Follow-up
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }}>
                    <FileText size={16} />
                    View Full History
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <User size={64} color="#E2E8F0" style={{ marginBottom: 16 }} />
                <h3 style={{ marginBottom: 8, color: '#64748B' }}>Select a Patient</h3>
                <p style={{ color: '#94A3B8' }}>
                  Click on a patient from the list to view their details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
