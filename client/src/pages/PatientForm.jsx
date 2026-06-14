import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, Ruler, Leaf } from 'lucide-react';
import { createPatient } from '../services/api';
import Toast from '../components/Toast';

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Physical Info', icon: Ruler },
  { label: 'Lifestyle', icon: Leaf },
];

const initialForm = {
  name: '', age: '', gender: '', placeOfResidence: '',
  referencePerson: '', natureOfWork: '',
  height: '', weight: '', bmi: '',
  sleepPatterns: '', diet: '',
};

export default function PatientForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const set = (field, value) => {
    const updated = { ...form, [field]: value };
    if (field === 'height' || field === 'weight') {
      const h = parseFloat(updated.height);
      const w = parseFloat(updated.weight);
      if (h > 0 && w > 0) {
        updated.bmi = (w / ((h / 100) ** 2)).toFixed(1);
      }
    }
    setForm(updated);
  };

  const canNext = () => {
    if (step === 0) return form.name && form.age && form.gender;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        age: parseInt(form.age),
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        bmi: form.bmi ? parseFloat(form.bmi) : undefined,
      };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      const patient = await createPatient(payload);
      navigate(`/patients/${patient.id}`);
    } catch {
      setToast({ msg: 'Failed to create patient', type: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <button className="back-link" onClick={() => navigate('/patients')}>
        <ArrowLeft size={16} /> Back to Patients
      </button>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card-header">
          <h3>Register New Patient</h3>
        </div>

        <div className="card-body">
          <div className="stepper">
            {STEPS.map((s, i) => (
              <div key={i} className={`step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                <div className="step-number">
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" placeholder="Enter patient name"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input className="form-control" type="number" placeholder="Age in years"
                    value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Place of Residence</label>
                  <input className="form-control" placeholder="City or town"
                    value={form.placeOfResidence} onChange={e => set('placeOfResidence', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Reference Person</label>
                  <input className="form-control" placeholder="Who referred this patient?"
                    value={form.referencePerson} onChange={e => set('referencePerson', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Nature of Work</label>
                  <input className="form-control" placeholder="Occupation type"
                    value={form.natureOfWork} onChange={e => set('natureOfWork', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input className="form-control" type="number" placeholder="e.g. 170"
                    value={form.height} onChange={e => set('height', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input className="form-control" type="number" placeholder="e.g. 65"
                    value={form.weight} onChange={e => set('weight', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>BMI (auto-calculated)</label>
                  <input className="form-control" readOnly value={form.bmi}
                    style={{ background: 'var(--border-light)' }} placeholder="—" />
                </div>
              </div>
              {form.bmi && (
                <div style={{ marginBottom: 20 }}>
                  <span className={`badge ${parseFloat(form.bmi) < 18.5 ? 'badge-warning' : parseFloat(form.bmi) > 25 ? 'badge-danger' : 'badge-success'}`}>
                    {parseFloat(form.bmi) < 18.5 ? 'Underweight' : parseFloat(form.bmi) > 30 ? 'Obese' : parseFloat(form.bmi) > 25 ? 'Overweight' : 'Normal'}
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="form-group">
                <label>Sleep Patterns</label>
                <textarea className="form-control"
                  placeholder="Describe sleep quality, duration, disturbances..."
                  value={form.sleepPatterns} onChange={e => set('sleepPatterns', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Diet</label>
                <textarea className="form-control"
                  placeholder="Dietary habits: vegetarian, non-veg, meal frequency, allergies..."
                  value={form.diet} onChange={e => set('diet', e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button
              className="btn btn-secondary"
              onClick={() => step > 0 ? setStep(step - 1) : navigate('/patients')}
            >
              <ArrowLeft size={16} /> {step > 0 ? 'Previous' : 'Cancel'}
            </button>

            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" disabled={!canNext() || submitting} onClick={handleSubmit}>
                <Check size={16} /> {submitting ? 'Creating...' : 'Create Patient'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
