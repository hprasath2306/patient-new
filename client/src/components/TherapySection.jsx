import { useState } from 'react';
import {
  Plus, Edit2, Trash2, Stethoscope, ChevronDown, ChevronUp,
  Home, Salad, Activity, Dumbbell, Wind, Hand, Brain, Music, Zap
} from 'lucide-react';
import {
  createTherapy, updateTherapy, deleteTherapy,
  createTherapyTools, updateTherapyTools,
  yogaApi, pranayamaApi, mudrasApi, breathingApi
} from '../services/api';
import Modal from './Modal';
import Toast from './Toast';

const toolCategories = [
  { key: 'yoga', label: 'Yoga', icon: Dumbbell, api: yogaApi,
    fields: [{ name: 'poses', label: 'Poses' }, { name: 'repeatingTimingsPerDay', label: 'Times/Day', type: 'number' }] },
  { key: 'pranayama', label: 'Pranayama', icon: Wind, api: pranayamaApi,
    fields: [{ name: 'techniques', label: 'Techniques' }, { name: 'repeatingTimingsPerDay', label: 'Times/Day', type: 'number' }] },
  { key: 'mudras', label: 'Mudras', icon: Hand, api: mudrasApi,
    fields: [{ name: 'mudraNames', label: 'Mudra Names' }, { name: 'repeatingTimingsPerDay', label: 'Times/Day', type: 'number' }] },
  { key: 'breathing', label: 'Breathing Exercises', icon: Wind, api: breathingApi,
    fields: [{ name: 'exercises', label: 'Exercises' }, { name: 'repeatingTimingsPerDay', label: 'Times/Day', type: 'number' }] },
  { key: 'meditation', label: 'Meditation', icon: Brain },
  { key: 'mantras', label: 'Mantras', icon: Music },
  { key: 'bandhas', label: 'Bandhas', icon: Zap },
];

const initTherapy = {
  name: '', fitnessOrTherapy: 'Therapy', homeRemedies: '', dietReference: '',
  lifestyleModifications: '', secondaryTherapy: '', aggravatingPoses: '',
  relievingPoses: '', flexibilityLevel: '', nerveStiffness: '',
  muscleStiffness: '', avoidablePoses: '', therapyPoses: '',
  sideEffects: '', progressiveReport: '',
};

export default function TherapySection({ diseases, patientId, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [form, setForm] = useState(initTherapy);
  const [expanded, setExpanded] = useState({});
  const [toolModal, setToolModal] = useState(null);
  const [toolForm, setToolForm] = useState({});
  const [toast, setToast] = useState(null);

  const allTherapies = diseases.flatMap(d =>
    (d.therapies || []).map(t => ({ ...t, disease: d }))
  );

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreate = async () => {
    try {
      await createTherapy(patientId, selectedDisease, form);
      setShowModal(false);
      setForm(initTherapy);
      setToast({ msg: 'Therapy added', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to add therapy', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this therapy?')) return;
    try {
      await deleteTherapy(id);
      setToast({ msg: 'Therapy deleted', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to delete', type: 'error' });
    }
  };

  const handleSaveTools = async (therapy) => {
    try {
      const { mantras, meditationTypes, bandhas, ...modifiers } = toolForm;
      const toolsPayload = { mantras, meditationTypes, bandhas };

      if (therapy.therapyTools) {
        await updateTherapyTools(therapy.therapyTools.id, toolsPayload);
        const toolsId = therapy.therapyTools.id;
        for (const cat of toolCategories.filter(c => c.api)) {
          const data = modifiers[cat.key];
          if (!data) continue;
          const existing = therapy.therapyTools[cat.key];
          if (existing) {
            await cat.api.update(existing.id, data);
          } else {
            await cat.api.create({ ...data, therapyToolsId: toolsId });
          }
        }
      } else {
        const tools = await createTherapyTools(patientId, therapy.disease.id, therapy.id, toolsPayload);
        for (const cat of toolCategories.filter(c => c.api)) {
          const data = modifiers[cat.key];
          if (data && Object.values(data).some(v => v)) {
            await cat.api.create({ ...data, therapyToolsId: tools.id });
          }
        }
      }
      setToolModal(null);
      setToast({ msg: 'Therapy tools saved', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to save tools', type: 'error' });
    }
  };

  const openToolModal = (therapy) => {
    const tt = therapy.therapyTools || {};
    setToolForm({
      mantras: tt.mantras || '',
      meditationTypes: tt.meditationTypes || '',
      bandhas: tt.bandhas || '',
      yoga: tt.yoga || {},
      pranayama: tt.pranayama || {},
      mudras: tt.mudras || {},
      breathing: tt.breathing || {},
    });
    setToolModal(therapy);
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem' }}>Therapies ({allTherapies.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => {
          if (diseases.length === 0) {
            setToast({ msg: 'Add a disease record first', type: 'error' });
            return;
          }
          setSelectedDisease(diseases[0].id);
          setShowModal(true);
        }}>
          <Plus size={14} /> Prescribe Therapy
        </button>
      </div>

      {allTherapies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allTherapies.map(t => (
            <div key={t.id} className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(t.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="stat-icon accent" style={{ width: 36, height: 36 }}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem' }}>{t.name}</h3>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span className={`badge ${t.fitnessOrTherapy === 'Fitness' ? 'badge-info' : 'badge-primary'}`}>
                        {t.fitnessOrTherapy}
                      </span>
                      <span className="badge badge-secondary">{t.disease.nameOfDisease || 'Unnamed'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openToolModal(t); }}>
                    <Dumbbell size={14} /> Tools
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                    onClick={e => { e.stopPropagation(); handleDelete(t.id); }}>
                    <Trash2 size={14} />
                  </button>
                  {expanded[t.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expanded[t.id] && (
                <div className="card-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label><Home size={12} /> Home Remedies</label>
                      <p>{t.homeRemedies || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label><Salad size={12} /> Diet Reference</label>
                      <p>{t.dietReference || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label><Activity size={12} /> Lifestyle Modifications</label>
                      <p>{t.lifestyleModifications || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Secondary Therapy</label>
                      <p>{t.secondaryTherapy || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Therapy Poses</label>
                      <p>{t.therapyPoses || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Flexibility Level</label>
                      <p>{t.flexibilityLevel || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Relieving Poses</label>
                      <p>{t.relievingPoses || '—'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Avoidable Poses</label>
                      <p>{t.avoidablePoses || '—'}</p>
                    </div>
                  </div>

                  {(t.sideEffects || t.progressiveReport) && (
                    <>
                      <hr className="section-divider" />
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Side Effects</label>
                          <p>{t.sideEffects || '—'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Progress Report</label>
                          <p>{t.progressiveReport || '—'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {t.therapyTools && (
                    <>
                      <hr className="section-divider" />
                      <h4 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Therapy Tools</h4>
                      <div className="therapy-tools-grid">
                        {t.therapyTools.yoga && (
                          <div className="tool-card active">
                            <Dumbbell size={24} />
                            <h4>Yoga</h4>
                            <p>{t.therapyTools.yoga.poses || 'Configured'}</p>
                            <p style={{ fontSize: '0.65rem', marginTop: 4 }}>{t.therapyTools.yoga.repeatingTimingsPerDay}x daily</p>
                          </div>
                        )}
                        {t.therapyTools.pranayama && (
                          <div className="tool-card active">
                            <Wind size={24} />
                            <h4>Pranayama</h4>
                            <p>{t.therapyTools.pranayama.techniques || 'Configured'}</p>
                            <p style={{ fontSize: '0.65rem', marginTop: 4 }}>{t.therapyTools.pranayama.repeatingTimingsPerDay}x daily</p>
                          </div>
                        )}
                        {t.therapyTools.mudras && (
                          <div className="tool-card active">
                            <Hand size={24} />
                            <h4>Mudras</h4>
                            <p>{t.therapyTools.mudras.mudraNames || 'Configured'}</p>
                            <p style={{ fontSize: '0.65rem', marginTop: 4 }}>{t.therapyTools.mudras.repeatingTimingsPerDay}x daily</p>
                          </div>
                        )}
                        {t.therapyTools.breathing && (
                          <div className="tool-card active">
                            <Wind size={24} />
                            <h4>Breathing</h4>
                            <p>{t.therapyTools.breathing.exercises || 'Configured'}</p>
                            <p style={{ fontSize: '0.65rem', marginTop: 4 }}>{t.therapyTools.breathing.repeatingTimingsPerDay}x daily</p>
                          </div>
                        )}
                        {t.therapyTools.mantras && (
                          <div className="tool-card active"><Music size={24} /><h4>Mantras</h4><p>{t.therapyTools.mantras}</p></div>
                        )}
                        {t.therapyTools.meditationTypes && (
                          <div className="tool-card active"><Brain size={24} /><h4>Meditation</h4><p>{t.therapyTools.meditationTypes}</p></div>
                        )}
                        {t.therapyTools.bandhas && (
                          <div className="tool-card active"><Zap size={24} /><h4>Bandhas</h4><p>{t.therapyTools.bandhas}</p></div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Stethoscope size={48} />
          <h3>No therapies prescribed</h3>
          <p>Prescribe a therapy for a disease to start treatment</p>
        </div>
      )}

      {/* New Therapy Modal */}
      {showModal && (
        <Modal title="Prescribe Therapy" onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Prescribe</button>
          </>}
        >
          <div className="form-group">
            <label>For Disease</label>
            <select className="form-control" value={selectedDisease || ''}
              onChange={e => setSelectedDisease(parseInt(e.target.value))}>
              {diseases.map(d => (
                <option key={d.id} value={d.id}>{d.nameOfDisease || `Disease #${d.id}`}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Therapy Name *</label>
              <input className="form-control" placeholder="e.g. Yoga Therapy Phase 1"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select className="form-control" value={form.fitnessOrTherapy}
                onChange={e => setForm({...form, fitnessOrTherapy: e.target.value})}>
                <option value="Therapy">Therapy</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Home Remedies</label>
            <textarea className="form-control" value={form.homeRemedies}
              onChange={e => setForm({...form, homeRemedies: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Diet Reference</label>
              <textarea className="form-control" value={form.dietReference}
                onChange={e => setForm({...form, dietReference: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Lifestyle Modifications</label>
              <textarea className="form-control" value={form.lifestyleModifications}
                onChange={e => setForm({...form, lifestyleModifications: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Therapy Poses</label>
              <input className="form-control" value={form.therapyPoses}
                onChange={e => setForm({...form, therapyPoses: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Flexibility Level</label>
              <input className="form-control" value={form.flexibilityLevel}
                onChange={e => setForm({...form, flexibilityLevel: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Progressive Report</label>
            <textarea className="form-control" value={form.progressiveReport}
              onChange={e => setForm({...form, progressiveReport: e.target.value})} />
          </div>
        </Modal>
      )}

      {/* Therapy Tools Modal */}
      {toolModal && (
        <Modal title={`Therapy Tools - ${toolModal.name}`} onClose={() => setToolModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setToolModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => handleSaveTools(toolModal)}>Save Tools</button>
          </>}
        >
          <h4 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Practice Tools</h4>
          {toolCategories.filter(c => c.api).map(cat => (
            <div key={cat.key} style={{ marginBottom: 16, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <cat.icon size={16} /> {cat.label}
              </h4>
              <div className="form-row">
                {cat.fields.map(f => (
                  <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                    <label>{f.label}</label>
                    <input
                      className="form-control"
                      type={f.type || 'text'}
                      value={toolForm[cat.key]?.[f.name] || ''}
                      onChange={e => setToolForm({
                        ...toolForm,
                        [cat.key]: { ...toolForm[cat.key], [f.name]: f.type === 'number' ? parseInt(e.target.value) || '' : e.target.value }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <hr className="section-divider" />
          <h4 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Additional Tools</h4>
          <div className="form-group">
            <label><Music size={14} style={{ verticalAlign: 'text-bottom' }} /> Mantras</label>
            <textarea className="form-control" value={toolForm.mantras || ''}
              onChange={e => setToolForm({...toolForm, mantras: e.target.value})} />
          </div>
          <div className="form-group">
            <label><Brain size={14} style={{ verticalAlign: 'text-bottom' }} /> Meditation Types</label>
            <textarea className="form-control" value={toolForm.meditationTypes || ''}
              onChange={e => setToolForm({...toolForm, meditationTypes: e.target.value})} />
          </div>
          <div className="form-group">
            <label><Zap size={14} style={{ verticalAlign: 'text-bottom' }} /> Bandhas</label>
            <textarea className="form-control" value={toolForm.bandhas || ''}
              onChange={e => setToolForm({...toolForm, bandhas: e.target.value})} />
          </div>
        </Modal>
      )}
    </div>
  );
}
