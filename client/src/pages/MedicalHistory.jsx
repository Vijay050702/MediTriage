import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Trash2, Calendar, Heart, AlertCircle, Pill } from 'lucide-react';
import { medicalRecordsAPI } from '../api';
import { showToast } from '../components/Toast';

const MedicalHistory = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: 'checkup',
    title: '',
    date: '',
    description: '',
    doctor: '',
    hospital: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await medicalRecordsAPI.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.title || !newRecord.date) {
      showToast('Please fill required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await medicalRecordsAPI.add(newRecord);
      showToast('Medical record added successfully', 'success');
      loadRecords();
      setNewRecord({ type: 'checkup', title: '', date: '', description: '', doctor: '', hospital: '' });
      setIsAdding(false);
    } catch (error) {
      showToast(error.message || 'Failed to add record', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await medicalRecordsAPI.delete(id);
      showToast('Record deleted', 'success');
      loadRecords();
    } catch (error) {
      showToast(error.message || 'Failed to delete record', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'report': return <FileText size={18} />;
      case 'prescription': return <Pill size={18} />;
      default: return <Heart size={18} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'report': return '#3B82F6';
      case 'prescription': return '#8B5CF6';
      default: return '#0D9488';
    }
  };

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1>Medical History</h1>
          <p>View and manage your medical records</p>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Heart size={24} color="#DC2626" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Blood Type</p>
                <h3 style={{ fontSize: '1.5rem' }}>{user?.blood_type || 'Not Set'}</h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={24} color="#F59E0B" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Allergies</p>
                <h3 style={{ fontSize: '1rem' }}>{user?.allergies || 'None'}</h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={24} color="#0D9488" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Records</p>
                <h3 style={{ fontSize: '1.5rem' }}>{records.length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Medical Records</h2>
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <Plus size={18} />
            Add Record
          </button>
        </div>

        {isAdding && (
          <div className="card" style={{ marginBottom: 24, borderColor: '#0D9488' }}>
            <h3 style={{ marginBottom: 16 }}>Add New Record</h3>
            <div className="form-row">
              <div className="input-group">
                <label>Record Type</label>
                <select value={newRecord.type} onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}>
                  <option value="checkup">Checkup</option>
                  <option value="report">Medical Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="surgery">Surgery</option>
                </select>
              </div>
              <div className="input-group">
                <label>Date *</label>
                <input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Title *</label>
              <input type="text" value={newRecord.title} onChange={(e) => setNewRecord({...newRecord, title: e.target.value})} placeholder="e.g., Annual Checkup" />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea value={newRecord.description} onChange={(e) => setNewRecord({...newRecord, description: e.target.value})} placeholder="Details about the record" rows={3} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Doctor Name</label>
                <input type="text" value={newRecord.doctor} onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})} placeholder="Doctor's name" />
              </div>
              <div className="input-group">
                <label>Hospital/Clinic</label>
                <input type="text" value={newRecord.hospital} onChange={(e) => setNewRecord({...newRecord, hospital: e.target.value})} placeholder="Hospital name" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddRecord} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {records.map(record => (
            <div key={record.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 8, 
                  background: `${getTypeColor(record.type)}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getTypeColor(record.type)
                }}>
                  {getTypeIcon(record.type)}
                </div>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{record.title}</h4>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 4 }}>{record.description}</p>
                  <div style={{ display: 'flex', gap: 16, color: '#94A3B8', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {record.record_date}
                    </span>
                    <span>{record.doctor_name}</span>
                    <span>{record.hospital}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteRecord(record.id)}
                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 8 }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <FileText size={64} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8, color: '#64748B' }}>No Medical Records</h3>
            <p style={{ color: '#94A3B8' }}>Add your first medical record to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
