import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, AlertTriangle, Clock, CheckCircle, Stethoscope, Calendar, Phone, MapPin, Heart, Activity, UserRound, Play, Brain, Eye, Ear, Wind, Bone, Footprints, Hand, ArrowRight } from 'lucide-react';
import { conditions, symptomsList } from '../data/conditions';
import { healthVideos } from '../data/healthVideos';
import { getRecommendedSpecializations } from '../data/specializations';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const bodyRegions = [
  {
    id: 'head',
    name: 'Head',
    icon: Brain,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    keywords: ['head', 'headache', 'migraine', 'ear', 'hearing', 'eye', 'vision', 'blurred', 'dizziness', 'nose', 'sinus', 'runny nose', 'congestion', 'sneezing', 'scalp', 'ringing', 'tinnitus', 'light', 'smell']
  },
  {
    id: 'face',
    name: 'Face & Jaw',
    icon: Eye,
    color: '#EC4899',
    bg: '#FDF2F8',
    keywords: ['face', 'facial', 'jaw', 'cheek', 'chin', 'mouth', 'lip', 'tongue', 'tooth', 'teeth', 'gum', 'dental', 'canker', 'chewing', 'taste', 'saliva', 'smile']
  },
  {
    id: 'eyes',
    name: 'Eyes',
    icon: Eye,
    color: '#6366F1',
    bg: '#EEF2FF',
    keywords: ['eye', 'vision', 'blurred', 'blind', 'floaters', 'flashes', 'red eyes', 'tearing', 'dry eyes', 'conjunctivitis', 'stye', 'glaucoma', 'cataract', 'halos', 'light sensitivity', 'photophobia']
  },
  {
    id: 'throat',
    name: 'Throat & Neck',
    icon: Activity,
    color: '#F59E0B',
    bg: '#FFFBEB',
    keywords: ['throat', 'neck', 'sore throat', 'swallowing', 'hoarse', 'voice', 'tonsil', 'laryngitis', 'pharyngitis', 'lymph nodes', 'swollen lymph', 'thyroid', 'stiff neck']
  },
  {
    id: 'chest',
    name: 'Chest & Lungs',
    icon: Wind,
    color: '#EF4444',
    bg: '#FEF2F2',
    keywords: ['chest', 'lung', 'breathing', 'shortness of breath', 'cough', 'wheezing', 'heart', 'palpitations', 'rapid heartbeat', 'irregular heartbeat', 'pneumonia', 'bronchitis', 'asthma', 'rib', 'breast']
  },
  {
    id: 'abdomen',
    name: 'Abdomen & Stomach',
    icon: Activity,
    color: '#F97316',
    bg: '#FFF7ED',
    keywords: ['abdomen', 'abdominal', 'stomach', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'gas', 'indigestion', 'heartburn', 'reflux', 'appetite', 'cramping abdominal', 'intestinal', 'bowel', 'colon']
  },
  {
    id: 'back',
    name: 'Back & Spine',
    icon: Bone,
    color: '#0D9488',
    bg: '#F0FDFA',
    keywords: ['back', 'spine', 'spinal', 'lower back', 'sciatica', 'posture', 'disc', 'neck pain', 'shoulder blade', 'rib']
  },
  {
    id: 'arms',
    name: 'Arms & Hands',
    icon: Hand,
    color: '#3B82F6',
    bg: '#EFF6FF',
    keywords: ['arm', 'hand', 'wrist', 'finger', 'elbow', 'shoulder', 'carpal', 'joint', 'arthritis', 'numbness in arm', 'tingling in arm', 'pain in arm', 'pain in shoulder']
  },
  {
    id: 'legs',
    name: 'Legs & Feet',
    icon: Footprints,
    color: '#10B981',
    bg: '#F0FDF4',
    keywords: ['leg', 'foot', 'knee', 'ankle', 'toe', 'hip', 'thigh', 'calf', 'joint stiffness', 'swelling in leg', 'leg pain', 'foot pain', 'gout', 'fracture', 'sprain', 'muscle cramp']
  },
  {
    id: 'skin',
    name: 'Skin & Hair',
    icon: Activity,
    color: '#D946EF',
    bg: '#FDF4FF',
    keywords: ['skin', 'hair', 'rash', 'itching', 'hives', 'dry skin', 'eczema', 'psoriasis', 'acne', 'blister', 'warts', 'mole', 'nail', 'scalp', 'sunburn', 'freckle']
  },
  {
    id: 'whole',
    name: 'Whole Body',
    icon: Heart,
    color: '#64748B',
    bg: '#F8FAFC',
    keywords: ['fever', 'fatigue', 'chills', 'body aches', 'sweating', 'weight', 'sleep', 'energy', 'malaise', 'weakness', 'dehydration', 'allergy', 'flu', 'infection']
  }
];

const painNatures = [
  { id: 'sharp', label: 'Sharp / Stabbing', icon: '⚡', symptoms: ['sharp pain', 'stabbing', 'severe pain'] },
  { id: 'dull', label: 'Dull / Aching', icon: '🔨', symptoms: ['dull pain', 'aching', 'pressure'] },
  { id: 'burning', label: 'Burning', icon: '🔥', symptoms: ['burning', 'burning sensation'] },
  { id: 'throbbing', label: 'Throbbing / Pulsing', icon: '💓', symptoms: ['throbbing', 'pulsing', 'pounding'] },
  { id: 'cramping', label: 'Cramping', icon: '🌀', symptoms: ['cramping', 'cramps', 'spasms'] },
  { id: 'tingling', label: 'Tingling / Numb', icon: '📴', symptoms: ['tingling', 'numbness', 'pins and needles'] }
];

const painOnsets = [
  { id: 'sudden', label: 'Sudden', icon: '💥', desc: 'Came on quickly (minutes to hours)' },
  { id: 'gradual', label: 'Gradual', icon: '📈', desc: 'Developed slowly over days/weeks' },
  { id: 'cyclic', label: 'Comes & Goes', icon: '🔄', desc: 'Comes and goes in episodes' }
];

const painSeverities = [
  { id: 'mild', label: 'Mild', icon: '🟢', desc: 'Noticeable but doesn\'t interfere with daily activities' },
  { id: 'moderate', label: 'Moderate', icon: '🟡', desc: 'Bothersome, affects some daily activities' },
  { id: 'severe', label: 'Severe', icon: '🔴', desc: 'Very painful, can\'t perform normal activities' }
];

const getSymptomsForRegion = (regionId) => {
  const region = bodyRegions.find(r => r.id === regionId);
  if (!region) return symptomsList;
  return symptomsList.filter(s =>
    region.keywords.some(k => s.includes(k))
  );
};

const SymptomChecker = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPainNature, setSelectedPainNature] = useState([]);
  const [selectedOnset, setSelectedOnset] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [step, setStep] = useState('region');

  const regionSymptoms = selectedRegion ? getSymptomsForRegion(selectedRegion) : symptomsList;
  const displayedSymptoms = showAllSymptoms ? regionSymptoms : regionSymptoms.slice(0, 20);

  const filteredSymptoms = useMemo(() => {
    if (!searchTerm) return [];
    return regionSymptoms.filter(s =>
      s.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSymptoms.includes(s)
    ).slice(0, 10);
  }, [searchTerm, selectedSymptoms, regionSymptoms]);

  const addSymptom = (symptom) => {
    if (selectedSymptoms.length >= 10) {
      showToast('Maximum 10 symptoms can be selected', 'warning');
      return;
    }
    setSelectedSymptoms(prev => [...prev, symptom]);
    setSearchTerm('');
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const selectRegion = (regionId) => {
    setSelectedRegion(regionId);
    setSearchTerm('');
    setShowAllSymptoms(false);
    setStep('pain');
    showToast(`Showing symptoms related to ${bodyRegions.find(r => r.id === regionId).name}`, 'success');
  };

  const togglePainNature = (natureId) => {
    setSelectedPainNature(prev =>
      prev.includes(natureId) ? prev.filter(id => id !== natureId) : [...prev, natureId]
    );
  };

  const matchSymptom = (keyword) => {
    const source = selectedRegion ? regionSymptoms : symptomsList;
    const exact = source.find(s => s === keyword);
    if (exact) return exact;
    return source.find(s => s.includes(keyword));
  };

  const autoAddPainSymptoms = () => {
    const toAdd = [];
    const keywords = [];
    if (selectedPainNature.length > 0) {
      selectedPainNature.forEach(natureId => {
        const nature = painNatures.find(n => n.id === natureId);
        if (nature) keywords.push(...nature.symptoms);
      });
    }
    if (selectedOnset) {
      const onsetMap = { sudden: ['sudden onset', 'sudden'], gradual: ['gradual'], cyclic: ['intermittent', 'recurring'] };
      onsetMap[selectedOnset]?.forEach(k => keywords.push(k));
    }
    if (selectedSeverity) {
      const severityMap = { mild: ['mild'], moderate: ['moderate'], severe: ['severe pain', 'severe'] };
      severityMap[selectedSeverity]?.forEach(k => keywords.push(k));
    }
    keywords.forEach(k => {
      const match = matchSymptom(k);
      if (match && !selectedSymptoms.includes(match) && !toAdd.includes(match)) {
        toAdd.push(match);
      }
    });
    if (toAdd.length > 0) {
      toAdd.forEach(s => {
        if (selectedSymptoms.length < 10) addSymptom(s);
      });
      showToast(`Added ${toAdd.length} symptom(s) based on your pain description`, 'success');
    }
    setStep('symptoms');
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      showToast('Please select at least one symptom', 'error');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const scoredConditions = conditions.map(condition => {
        const matchingSymptoms = condition.symptoms.filter(s =>
          selectedSymptoms.includes(s)
        );
        const matchRatio = matchingSymptoms.length / condition.symptoms.length;
        const userMatchRatio = matchingSymptoms.length / selectedSymptoms.length;
        const score = (matchRatio * 0.6 + userMatchRatio * 0.4) * 100;

        return {
          ...condition,
          matchingSymptoms,
          score: Math.round(score)
        };
      })
      .filter(c => c.matchingSymptoms.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

      const triageLevel = scoredConditions[0]?.triage || 'normal';

      setResults({
        conditions: scoredConditions,
        triage: triageLevel,
        symptomCount: selectedSymptoms.length
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getTriageInfo = (triage) => {
    switch (triage) {
      case 'emergency':
        return {
          label: 'Emergency',
          color: '#DC2626',
          bg: '#FEE2E2',
          icon: AlertTriangle,
          desc: 'Seek immediate medical attention - Call 102/108'
        };
      case 'urgent':
        return {
          label: 'Urgent',
          color: '#F59E0B',
          bg: '#FEF3C7',
          icon: Clock,
          desc: 'See a doctor within 24 hours'
        };
      default:
        return {
          label: 'Normal',
          color: '#10B981',
          bg: '#D1FAE5',
          icon: CheckCircle,
          desc: 'Rest and monitor symptoms'
        };
    }
  };

  const triageInfo = results ? getTriageInfo(results.triage) : null;
  const TriageIcon = triageInfo?.icon;

  const clearAll = () => {
    setSelectedSymptoms([]);
    setResults(null);
    setSearchTerm('');
    setSelectedRegion(null);
    setSelectedPainNature([]);
    setSelectedOnset(null);
    setSelectedSeverity(null);
    setStep('region');
    setShowAllSymptoms(false);
  };

  const resetToRegion = () => {
    setSelectedRegion(null);
    setSelectedPainNature([]);
    setSelectedOnset(null);
    setSelectedSeverity(null);
    setSelectedSymptoms([]);
    setResults(null);
    setSearchTerm('');
    setShowAllSymptoms(false);
    setStep('region');
  };

  const renderRegionStep = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Where does it hurt?</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Select the area of your body where you're experiencing symptoms</p>
      </div>
      <div className="grid grid-4" style={{ gap: 12 }}>
        {bodyRegions.map(region => {
          const Icon = region.icon;
          return (
            <button
              key={region.id}
              onClick={() => selectRegion(region.id)}
              style={{
                padding: '20px 12px',
                border: `2px solid ${selectedRegion === region.id ? region.color : '#E2E8F0'}`,
                borderRadius: 12,
                background: selectedRegion === region.id ? region.bg : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (selectedRegion !== region.id) e.currentTarget.style.borderColor = region.color; }}
              onMouseOut={(e) => { if (selectedRegion !== region.id) e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              <Icon size={32} color={region.color} style={{ marginBottom: 8 }} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E293B' }}>{region.name}</p>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          onClick={() => { setStep('symptoms'); setSelectedRegion(null); }}
          className="btn btn-outline"
          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
        >
          I know my symptoms — skip to search
        </button>
      </div>
    </div>
  );

  const renderPainStep = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button
          onClick={resetToRegion}
          style={{ background: 'none', border: 'none', color: '#0D9488', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← Change body area
        </button>
        <span style={{ color: '#94A3B8' }}>|</span>
        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
          {bodyRegions.find(r => r.id === selectedRegion)?.name}
        </span>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>What does the pain feel like?</h3>
        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 16 }}>Select all that apply (this adds related symptoms automatically)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {painNatures.map(nature => (
            <button
              key={nature.id}
              onClick={() => togglePainNature(nature.id)}
              style={{
                padding: '10px 18px',
                border: `2px solid ${selectedPainNature.includes(nature.id) ? '#0D9488' : '#E2E8F0'}`,
                borderRadius: 10,
                background: selectedPainNature.includes(nature.id) ? '#F0FDFA' : 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: selectedPainNature.includes(nature.id) ? 600 : 400,
                color: selectedPainNature.includes(nature.id) ? '#0D9488' : '#64748B',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{nature.icon}</span> {nature.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>When did it start?</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {painOnsets.map(onset => (
            <button
              key={onset.id}
              onClick={() => setSelectedOnset(selectedOnset === onset.id ? null : onset.id)}
              style={{
                flex: 1, minWidth: 160,
                padding: '14px 18px',
                border: `2px solid ${selectedOnset === onset.id ? '#0D9488' : '#E2E8F0'}`,
                borderRadius: 10,
                background: selectedOnset === onset.id ? '#F0FDFA' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.2rem' }}>{onset.icon}</span>
                <span style={{ fontWeight: selectedOnset === onset.id ? 600 : 400, color: '#1E293B' }}>{onset.label}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: 28 }}>{onset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>How severe is it?</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {painSeverities.map(severity => (
            <button
              key={severity.id}
              onClick={() => setSelectedSeverity(selectedSeverity === severity.id ? null : severity.id)}
              style={{
                flex: 1, minWidth: 160,
                padding: '14px 18px',
                border: `2px solid ${selectedSeverity === severity.id ? '#0D9488' : '#E2E8F0'}`,
                borderRadius: 10,
                background: selectedSeverity === severity.id ? '#F0FDFA' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.2rem' }}>{severity.icon}</span>
                <span style={{ fontWeight: selectedSeverity === severity.id ? 600 : 400, color: '#1E293B' }}>{severity.label}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: 28 }}>{severity.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={autoAddPainSymptoms}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          Continue to Symptoms <ArrowRight size={16} />
        </button>
        <button
          onClick={() => { setStep('symptoms'); }}
          className="btn btn-outline"
          style={{ padding: '12px 20px', fontSize: '0.85rem' }}
        >
          Skip
        </button>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {selectedRegion && (
          <>
            <button
              onClick={() => setStep('pain')}
              style={{ background: 'none', border: 'none', color: '#0D9488', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ← Pain details
            </button>
            <span style={{ color: '#94A3B8' }}>|</span>
          </>
        )}
        <button
          onClick={resetToRegion}
          style={{ background: 'none', border: 'none', color: '#0D9488', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← Body area
        </button>
        <span style={{ color: '#94A3B8', marginLeft: 8, fontSize: '0.85rem' }}>
          {selectedRegion && `${bodyRegions.find(r => r.id === selectedRegion)?.name} • `}
          {regionSymptoms.length} related symptoms
        </span>
      </div>

      <div className="input-group" style={{ position: 'relative' }}>
        <label>Search Symptoms</label>
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
            placeholder="Type a symptom..."
            style={{ paddingLeft: 40 }}
          />
        </div>
        {filteredSymptoms.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxHeight: 200,
            overflow: 'auto'
          }}>
            {filteredSymptoms.map(symptom => (
              <button
                key={symptom}
                onClick={() => addSymptom(symptom)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#F8FAFC'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                {symptom}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 500, marginBottom: 8 }}>
          {selectedRegion ? `Common ${bodyRegions.find(r => r.id === selectedRegion)?.name} Symptoms` : 'Common Symptoms'}
          <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: 8, fontSize: '0.8rem' }}>
            (click to add)
          </span>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {displayedSymptoms.slice(0, showAllSymptoms ? 70 : 15).map(symptom => (
            <button
              key={symptom}
              onClick={() => addSymptom(symptom)}
              disabled={selectedSymptoms.includes(symptom)}
              style={{
                padding: '6px 12px',
                border: selectedSymptoms.includes(symptom) ? '2px solid #0D9488' : '1px solid #E2E8F0',
                borderRadius: 20,
                background: selectedSymptoms.includes(symptom) ? '#0D9488' : 'white',
                color: selectedSymptoms.includes(symptom) ? 'white' : '#64748B',
                cursor: selectedSymptoms.includes(symptom) ? 'default' : 'pointer',
                fontSize: '0.75rem',
                opacity: selectedSymptoms.includes(symptom) ? 0.8 : 1
              }}
            >
              {symptom}
            </button>
          ))}
        </div>
        {!showAllSymptoms && regionSymptoms.length > 15 && (
          <button
            onClick={() => setShowAllSymptoms(true)}
            style={{
              marginTop: 8,
              background: 'none',
              border: 'none',
              color: '#0D9488',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            + Show more symptoms ({regionSymptoms.length - 15} more)
          </button>
        )}
      </div>

      {selectedSymptoms.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontWeight: 500 }}>
              Selected Symptoms ({selectedSymptoms.length}/10)
            </label>
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#DC2626',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedSymptoms.map(symptom => (
              <span key={symptom} className="symptom-tag">
                {symptom}
                <button onClick={() => removeSymptom(symptom)}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 24 }}
        onClick={analyzeSymptoms}
        disabled={isAnalyzing || selectedSymptoms.length === 0}
      >
        {isAnalyzing ? (
          <>Analyzing your symptoms...</>
        ) : (
          <>
            <Stethoscope size={18} />
            Analyze Symptoms
          </>
        )}
      </button>
    </div>
  );

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
      {['region', 'pain', 'symptoms'].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: step === s ? '#0D9488' : ['region', 'pain', 'symptoms'].indexOf(step) > i ? '#0D9488' : '#E2E8F0',
            color: step === s || ['region', 'pain', 'symptoms'].indexOf(step) > i ? 'white' : '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 600
          }}>
            {['region', 'pain', 'symptoms'].indexOf(step) > i ? '✓' : i + 1}
          </div>
          <span style={{
            fontSize: '0.8rem',
            color: step === s ? '#0D9488' : '#94A3B8',
            fontWeight: step === s ? 600 : 400
          }}>
            {s === 'region' ? 'Body Area' : s === 'pain' ? 'Pain Type' : 'Symptoms'}
          </span>
          {i < 2 && <div style={{ width: 40, height: 2, background: ['region', 'pain', 'symptoms'].indexOf(step) > i ? '#0D9488' : '#E2E8F0' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1>AI Symptom Checker</h1>
          <p>Select your symptoms to get AI-powered analysis and recommendations</p>
        </div>

        <div className="grid grid-2" style={{ gap: 32 }}>
          <div>
            <div className="card">
              {renderStepIndicator()}

              {step === 'region' && renderRegionStep()}
              {step === 'pain' && renderPainStep()}
              {step === 'symptoms' && renderSymptomsStep()}
            </div>
          </div>

          <div>
            {results && (
              <div className="card" style={{ borderLeft: `4px solid ${triageInfo.color}` }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  background: triageInfo.bg,
                  borderRadius: 8,
                  marginBottom: 24
                }}>
                  <TriageIcon size={32} color={triageInfo.color} />
                  <div>
                    <h3 style={{ color: triageInfo.color, marginBottom: 4 }}>
                      {triageInfo.label} Case
                    </h3>
                    <p style={{ color: triageInfo.color, fontSize: '0.875rem' }}>
                      {triageInfo.desc}
                    </p>
                  </div>
                </div>

                <h4 style={{ marginBottom: 16 }}>Possible Conditions ({results.conditions.length})</h4>

                {results.conditions.map((condition, index) => (
                  <div key={condition.id} className="condition-card">
                    <div className="condition-header">
                      <span className="condition-name">
                        {index + 1}. {condition.name}
                      </span>
                      <span className={`probability ${
                        condition.score >= 70 ? 'probability-high' :
                        condition.score >= 40 ? 'probability-medium' : 'probability-low'
                      }`}>
                        {condition.score}% match
                      </span>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 12 }}>
                      <strong>Matching symptoms:</strong> {condition.matchingSymptoms.join(', ')}
                    </p>
                    <div>
                      <p style={{ fontWeight: 500, marginBottom: 8 }}>Recommendations:</p>
                      <ul style={{ paddingLeft: 20, color: '#64748B', fontSize: '0.875rem' }}>
                        {condition.recommendations.map((rec, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: 12, padding: 12, background: '#F0FDFA', borderRadius: 8 }}>
                      <p style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserRound size={16} color="#0D9488" />
                        Recommended Specialist:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {getRecommendedSpecializations(condition.name).map((spec, i) => (
                          <span key={i} style={{
                            padding: '4px 10px',
                            background: '#0D9488',
                            color: 'white',
                            borderRadius: 16,
                            fontSize: '0.75rem'
                          }}>
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    {healthVideos[condition.name] && healthVideos[condition.name].length > 0 && (
                      <div style={{ marginTop: 12, padding: 12, background: '#FFF7ED', borderRadius: 8 }}>
                        <p style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Activity size={16} color="#EA580C" />
                          Related Health Videos:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {healthVideos[condition.name].map((video, i) => (
                            <a
                              key={i}
                              href={`https://www.youtube.com/watch?v=${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                background: 'white',
                                borderRadius: 8,
                                textDecoration: 'none',
                                border: '1px solid #FFEDD5',
                                transition: 'background 0.2s',
                                cursor: 'pointer'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#FFF7ED'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <div style={{
                                width: 32,
                                height: 24,
                                background: '#DC2626',
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Play size={14} color="white" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {video.title}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                  {video.channel}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {results.triage === 'emergency' ? (
                    <Link to="/emergency" className="btn btn-emergency" style={{ flex: 1 }}>
                      <Phone size={18} />
                      Call Emergency (102/108)
                    </Link>
                  ) : (
                    <Link to="/appointments" className="btn btn-primary" style={{ flex: 1 }}>
                      <Calendar size={18} />
                      Book Appointment
                    </Link>
                  )}
                  <button onClick={clearAll} className="btn btn-outline">
                    New Analysis
                  </button>
                </div>
              </div>
            )}

            {!results && (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <Stethoscope size={64} color="#E2E8F0" style={{ marginBottom: 16 }} />
                <h3 style={{ marginBottom: 8, color: '#64748B' }}>No Analysis Yet</h3>
                <p style={{ color: '#94A3B8', marginBottom: 16 }}>
                  {step === 'region'
                    ? 'Select the area where you feel pain to get started'
                    : step === 'pain'
                    ? 'Describe your pain to help narrow down the possibilities'
                    : 'Select your symptoms and click "Analyze Symptoms" to get your results'}
                </p>
                <div style={{ textAlign: 'left', background: '#F8FAFC', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ marginBottom: 12 }}>How it works:</h4>
                  <ol style={{ paddingLeft: 20, color: '#64748B', fontSize: '0.875rem' }}>
                    <li style={{ marginBottom: 8 }}><strong>Step 1:</strong> Select the body area where you feel pain</li>
                    <li style={{ marginBottom: 8 }}><strong>Step 2:</strong> Describe what the pain feels like (sharp, dull, burning, etc.)</li>
                    <li style={{ marginBottom: 8 }}><strong>Step 3:</strong> Review and refine your symptoms from the filtered list</li>
                    <li style={{ marginBottom: 8 }}><strong>Step 4:</strong> Click "Analyze Symptoms" to get AI-powered results</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 32, background: '#FFFBEB', borderColor: '#F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={24} color="#F59E0B" />
            <div>
              <h4 style={{ marginBottom: 4 }}>Important Disclaimer</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                This symptom checker is for informational purposes only and should not be used as a substitute
                for professional medical advice, diagnosis, or treatment. Always seek the advice of your
                physician or other qualified health provider with any questions you may have regarding a
                medical condition. In case of emergency, call 102 or 108 immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
