import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Plus, MapPin, Briefcase,
  Calendar, Activity, FileText, Stethoscope, Heart,
  TrendingUp, User, ClipboardList, Scale, Moon, Utensils
} from 'lucide-react';
import { getPatient, updatePatient, deletePatient, createDisease } from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import DiseaseCard from '../components/DiseaseCard';
import TherapySection from '../components/TherapySection';
import MedicalReportsSection from '../components/MedicalReportsSection';
import ProgressSection from '../components/ProgressSection';

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'diseases', label: 'Diseases', icon: ClipboardList },
  { key: 'history', label: 'Medical History', icon: Activity },
  { key: 'reports', label: 'Medical Reports', icon: FileText },
  { key: 'therapies', label: 'Therapies', icon: Stethoscope },
  { key: 'progress', label: 'Progress Tracking', icon: TrendingUp },
];

const initDisease = {
  nameOfDisease: '', chiefComplaint: '', timePeriod: '', onsetOfDisease: '',
  symptoms: '', locationOfPain: '', severity: '', recurrenceTiming: '',
  aggravatingFactors: '', typeOfDisease: '',
  anatomicalReference: '', physiologicalReference: '', psychologicalReference: '',
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState(initDisease);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    getPatient(id)
      .then(p => { setPatient(p); setEditForm(p); })
      .catch(() => navigate('/patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async () => {
    try {
      const payload = { ...editForm };
      ['id', 'diseases', 'createdAt', 'updatedAt'].forEach(k => delete payload[k]);
      if (payload.height) payload.height = parseFloat(payload.height);
      if (payload.weight) payload.weight = parseFloat(payload.weight);
      if (payload.age) payload.age = parseInt(payload.age);
      await updatePatient(id, payload);
      setEditing(false);
      setToast({ msg: 'Patient updated', type: 'success' });
      load();
    } catch {
      setToast({ msg: 'Update failed', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this patient? This cannot be undone.')) return;
    try {
      await deletePatient(id);
      navigate('/patients');
    } catch {
      setToast({ msg: 'Failed to delete patient', type: 'error' });
    }
  };

  const handleAddDisease = async () => {
    try {
      await createDisease(id, diseaseForm);
      setShowDiseaseModal(false);
      setDiseaseForm(initDisease);
      setToast({ msg: 'Disease record added', type: 'success' });
      load();
    } catch {
      setToast({ msg: 'Failed to add disease', type: 'error' });
    }
  };

  if (loading) return <Loading />;
  if (!patient) return null;

  const diseases = patient.diseases || [];

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <button className="back-link" onClick={() => navigate('/patients')}>
        <ArrowLeft size={16} /> Back to Patients
      </button>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-header">
          <div className="avatar avatar-lg">
            {patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{patient.name}</h2>
            <p>Patient ID: #{patient.id}</p>
            <div className="profile-meta">
              <span><Calendar size={14} /> Age: {patient.age}</span>
              <span><User size={14} /> {patient.gender}</span>
              {patient.placeOfResidence && <span><MapPin size={14} /> {patient.placeOfResidence}</span>}
              {patient.natureOfWork && <span><Briefcase size={14} /> {patient.natureOfWork}</span>}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderBottom: '1px solid var(--border-light)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>

        <div className="tabs" style={{ padding: '0 20px' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div className="card-body">
          {tab === 'overview' && (
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Patient Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{patient.name}</p>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <p>{patient.age} years</p>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <p>{patient.gender}</p>
                </div>
                <div className="detail-item">
                  <label>Place of Residence</label>
                  <p>{patient.placeOfResidence || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Reference Person</label>
                  <p>{patient.referencePerson || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Nature of Work</label>
                  <p>{patient.natureOfWork || '—'}</p>
                </div>
              </div>

              <hr className="section-divider" />
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={18} /> Physical Measurements
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Height</label>
                  <p>{patient.height ? `${patient.height} cm` : '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Weight</label>
                  <p>{patient.weight ? `${patient.weight} kg` : '—'}</p>
                </div>
                <div className="detail-item">
                  <label>BMI</label>
                  <p>
                    {patient.bmi ? (
                      <span className={`badge ${patient.bmi < 18.5 ? 'badge-warning' : patient.bmi > 25 ? 'badge-danger' : 'badge-success'}`}>
                        {patient.bmi.toFixed(1)}
                      </span>
                    ) : '—'}
                  </p>
                </div>
              </div>

              <hr className="section-divider" />
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={18} /> Lifestyle
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label><Moon size={14} style={{ verticalAlign: 'text-bottom' }} /> Sleep Patterns</label>
                  <p>{patient.sleepPatterns || '—'}</p>
                </div>
                <div className="detail-item">
                  <label><Utensils size={14} style={{ verticalAlign: 'text-bottom' }} /> Diet</label>
                  <p>{patient.diet || '—'}</p>
                </div>
              </div>

              <hr className="section-divider" />
              <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Quick Summary</h3>
              <div className="stats-grid" style={{ marginBottom: 0 }}>
                <div className="stat-card">
                  <div className="stat-icon primary"><ClipboardList size={20} /></div>
                  <div className="stat-info"><h3>{diseases.length}</h3><p>Disease Records</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon accent"><Stethoscope size={20} /></div>
                  <div className="stat-info">
                    <h3>{diseases.reduce((s, d) => s + (d.therapies?.length || 0), 0)}</h3>
                    <p>Therapies</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon success"><FileText size={20} /></div>
                  <div className="stat-info">
                    <h3>{diseases.reduce((s, d) => s + (d.medicalReports?.length || 0), 0)}</h3>
                    <p>Reports</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'diseases' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem' }}>Disease Records ({diseases.length})</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowDiseaseModal(true)}>
                  <Plus size={14} /> Add Disease
                </button>
              </div>
              {diseases.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {diseases.map(d => (
                    <DiseaseCard key={d.id} disease={d} patientId={patient.id} onRefresh={load} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <h3>No disease records</h3>
                  <p>Add a disease record to start tracking</p>
                  <button className="btn btn-primary" onClick={() => setShowDiseaseModal(true)}>
                    <Plus size={16} /> Add Disease
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Medical History</h3>
              {diseases.filter(d => d.medicalHistory).length > 0 ? (
                diseases.filter(d => d.medicalHistory).map(d => (
                  <div key={d.id} className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <h3 style={{ fontSize: '0.9rem' }}>
                        <span className="badge badge-primary" style={{ marginRight: 8 }}>{d.nameOfDisease || 'Unnamed'}</span>
                        History
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Childhood Illness</label>
                          <p>{d.medicalHistory.childhoodIllness || '—'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Psychiatric Illness</label>
                          <p>{d.medicalHistory.psychiatricIllness || '—'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Occupational Influences</label>
                          <p>{d.medicalHistory.occupationalInfluences || '—'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Operations / Surgeries</label>
                          <p>{d.medicalHistory.operationsOrSurgeries || '—'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Hereditary</label>
                          <p>
                            <span className={`badge ${d.medicalHistory.hereditary ? 'badge-warning' : 'badge-success'}`}>
                              {d.medicalHistory.hereditary ? 'Yes' : 'No'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={48} />
                  <h3>No medical history</h3>
                  <p>Medical history will appear when added to disease records</p>
                </div>
              )}
            </div>
          )}

          {tab === 'reports' && (
            <MedicalReportsSection diseases={diseases} patientId={patient.id} onRefresh={load} />
          )}

          {tab === 'therapies' && (
            <TherapySection diseases={diseases} patientId={patient.id} onRefresh={load} />
          )}

          {tab === 'progress' && (
            <ProgressSection diseases={diseases} patient={patient} />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal title="Edit Patient" onClose={() => setEditing(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
          </>}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={editForm.name || ''}
                onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input className="form-control" type="number" value={editForm.age || ''}
                onChange={e => setEditForm({...editForm, age: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={editForm.gender || ''}
                onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Residence</label>
              <input className="form-control" value={editForm.placeOfResidence || ''}
                onChange={e => setEditForm({...editForm, placeOfResidence: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Height (cm)</label>
              <input className="form-control" type="number" value={editForm.height || ''}
                onChange={e => setEditForm({...editForm, height: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input className="form-control" type="number" value={editForm.weight || ''}
                onChange={e => setEditForm({...editForm, weight: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Sleep Patterns</label>
            <textarea className="form-control" value={editForm.sleepPatterns || ''}
              onChange={e => setEditForm({...editForm, sleepPatterns: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Diet</label>
            <textarea className="form-control" value={editForm.diet || ''}
              onChange={e => setEditForm({...editForm, diet: e.target.value})} />
          </div>
        </Modal>
      )}

      {/* Add Disease Modal */}
      {showDiseaseModal && (
        <Modal title="Add Disease Record" onClose={() => setShowDiseaseModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowDiseaseModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddDisease}>Add Disease</button>
          </>}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Disease Name</label>
              <input className="form-control" placeholder="e.g. Cervical Spondylosis"
                value={diseaseForm.nameOfDisease}
                onChange={e => setDiseaseForm({...diseaseForm, nameOfDisease: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type of Disease</label>
              <select className="form-control" value={diseaseForm.typeOfDisease}
                onChange={e => setDiseaseForm({...diseaseForm, typeOfDisease: e.target.value})}>
                <option value="">Select type</option>
                <option value="Acute">Acute</option>
                <option value="Chronic">Chronic</option>
                <option value="Recurring">Recurring</option>
                <option value="Degenerative">Degenerative</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Chief Complaint</label>
            <textarea className="form-control" placeholder="Primary complaint of the patient"
              value={diseaseForm.chiefComplaint}
              onChange={e => setDiseaseForm({...diseaseForm, chiefComplaint: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Symptoms</label>
              <textarea className="form-control" placeholder="List of symptoms"
                value={diseaseForm.symptoms}
                onChange={e => setDiseaseForm({...diseaseForm, symptoms: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Location of Pain</label>
              <input className="form-control" placeholder="Body area affected"
                value={diseaseForm.locationOfPain}
                onChange={e => setDiseaseForm({...diseaseForm, locationOfPain: e.target.value})} />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>Severity</label>
              <select className="form-control" value={diseaseForm.severity}
                onChange={e => setDiseaseForm({...diseaseForm, severity: e.target.value})}>
                <option value="">Select</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Onset</label>
              <input className="form-control" placeholder="Gradual / Sudden"
                value={diseaseForm.onsetOfDisease}
                onChange={e => setDiseaseForm({...diseaseForm, onsetOfDisease: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Time Period</label>
              <input className="form-control" placeholder="e.g. 6 months"
                value={diseaseForm.timePeriod}
                onChange={e => setDiseaseForm({...diseaseForm, timePeriod: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Aggravating Factors</label>
            <textarea className="form-control" placeholder="What makes it worse?"
              value={diseaseForm.aggravatingFactors}
              onChange={e => setDiseaseForm({...diseaseForm, aggravatingFactors: e.target.value})} />
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>Anatomical Reference</label>
              <input className="form-control" value={diseaseForm.anatomicalReference}
                onChange={e => setDiseaseForm({...diseaseForm, anatomicalReference: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Physiological Reference</label>
              <input className="form-control" value={diseaseForm.physiologicalReference}
                onChange={e => setDiseaseForm({...diseaseForm, physiologicalReference: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Psychological Reference</label>
              <input className="form-control" value={diseaseForm.psychologicalReference}
                onChange={e => setDiseaseForm({...diseaseForm, psychologicalReference: e.target.value})} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
