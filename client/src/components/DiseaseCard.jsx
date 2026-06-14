import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Edit2, Trash2, Plus,
  AlertTriangle, Clock, MapPin, Activity
} from 'lucide-react';
import { updateDisease, deleteDisease, createMedicalHistory, updateMedicalHistory } from '../services/api';
import Modal from './Modal';
import Toast from './Toast';

const severityConfig = {
  Mild: { color: 'badge-success', dots: 1 },
  Moderate: { color: 'badge-warning', dots: 2 },
  Severe: { color: 'badge-danger', dots: 3 },
  Critical: { color: 'badge-danger', dots: 4 },
};

export default function DiseaseCard({ disease, patientId, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(disease);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyForm, setHistoryForm] = useState(
    disease.medicalHistory || {
      childhoodIllness: '', psychiatricIllness: '',
      occupationalInfluences: '', operationsOrSurgeries: '', hereditary: false,
    }
  );
  const [toast, setToast] = useState(null);

  const handleUpdate = async () => {
    try {
      const payload = { ...form };
      ['id', 'patientId', 'patient', 'medicalHistory', 'therapies', 'medicalReports'].forEach(k => delete payload[k]);
      await updateDisease(disease.id, payload);
      setEditing(false);
      setToast({ msg: 'Disease updated', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Update failed', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this disease record?')) return;
    try {
      await deleteDisease(disease.id);
      setToast({ msg: 'Disease deleted', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to delete', type: 'error' });
    }
  };

  const handleSaveHistory = async () => {
    try {
      if (disease.medicalHistory) {
        await updateMedicalHistory(disease.medicalHistory.id, historyForm);
      } else {
        await createMedicalHistory(patientId, disease.id, historyForm);
      }
      setShowHistoryModal(false);
      setToast({ msg: 'Medical history saved', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to save history', type: 'error' });
    }
  };

  const sev = severityConfig[disease.severity] || {};

  return (
    <div className="card">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div
        className="card-header"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="stat-icon secondary" style={{ width: 36, height: 36 }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem' }}>{disease.nameOfDisease || 'Unnamed Disease'}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {disease.severity && (
                <span className={`badge ${sev.color}`}>
                  <AlertTriangle size={10} /> {disease.severity}
                </span>
              )}
              {disease.typeOfDisease && (
                <span className="badge badge-info">{disease.typeOfDisease}</span>
              )}
              {disease.timePeriod && (
                <span className="badge badge-secondary">
                  <Clock size={10} /> {disease.timePeriod}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditing(true); }}>
            <Edit2 size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
            onClick={e => { e.stopPropagation(); handleDelete(); }}>
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div className="card-body">
          <div className="detail-grid" style={{ marginBottom: 20 }}>
            <div className="detail-item">
              <label>Chief Complaint</label>
              <p>{disease.chiefComplaint || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Symptoms</label>
              <p>{disease.symptoms || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Location of Pain</label>
              <p>{disease.locationOfPain || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Onset</label>
              <p>{disease.onsetOfDisease || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Recurrence Timing</label>
              <p>{disease.recurrenceTiming || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Aggravating Factors</label>
              <p>{disease.aggravatingFactors || '—'}</p>
            </div>
          </div>

          {(disease.anatomicalReference || disease.physiologicalReference || disease.psychologicalReference) && (
            <>
              <hr className="section-divider" />
              <h4 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Medical References</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Anatomical</label>
                  <p>{disease.anatomicalReference || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Physiological</label>
                  <p>{disease.physiologicalReference || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Psychological</label>
                  <p>{disease.psychologicalReference || '—'}</p>
                </div>
              </div>
            </>
          )}

          <hr className="section-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Medical History
              {disease.medicalHistory && <span className="badge badge-success" style={{ marginLeft: 8 }}>Recorded</span>}
            </h4>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(true)}>
              <Plus size={14} /> {disease.medicalHistory ? 'Edit History' : 'Add History'}
            </button>
          </div>

          {disease.medicalHistory && (
            <div className="detail-grid" style={{ marginTop: 12 }}>
              <div className="detail-item">
                <label>Childhood Illness</label>
                <p>{disease.medicalHistory.childhoodIllness || '—'}</p>
              </div>
              <div className="detail-item">
                <label>Psychiatric Illness</label>
                <p>{disease.medicalHistory.psychiatricIllness || '—'}</p>
              </div>
              <div className="detail-item">
                <label>Operations/Surgeries</label>
                <p>{disease.medicalHistory.operationsOrSurgeries || '—'}</p>
              </div>
              <div className="detail-item">
                <label>Hereditary</label>
                <p>
                  <span className={`badge ${disease.medicalHistory.hereditary ? 'badge-warning' : 'badge-success'}`}>
                    {disease.medicalHistory.hereditary ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {editing && (
        <Modal title="Edit Disease Record" onClose={() => setEditing(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
          </>}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Disease Name</label>
              <input className="form-control" value={form.nameOfDisease || ''}
                onChange={e => setForm({...form, nameOfDisease: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select className="form-control" value={form.severity || ''}
                onChange={e => setForm({...form, severity: e.target.value})}>
                <option value="">Select</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Chief Complaint</label>
            <textarea className="form-control" value={form.chiefComplaint || ''}
              onChange={e => setForm({...form, chiefComplaint: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Symptoms</label>
            <textarea className="form-control" value={form.symptoms || ''}
              onChange={e => setForm({...form, symptoms: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.typeOfDisease || ''}
                onChange={e => setForm({...form, typeOfDisease: e.target.value})}>
                <option value="">Select</option>
                <option value="Acute">Acute</option>
                <option value="Chronic">Chronic</option>
                <option value="Recurring">Recurring</option>
                <option value="Degenerative">Degenerative</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time Period</label>
              <input className="form-control" value={form.timePeriod || ''}
                onChange={e => setForm({...form, timePeriod: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Aggravating Factors</label>
            <textarea className="form-control" value={form.aggravatingFactors || ''}
              onChange={e => setForm({...form, aggravatingFactors: e.target.value})} />
          </div>
        </Modal>
      )}

      {showHistoryModal && (
        <Modal title="Medical History" onClose={() => setShowHistoryModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveHistory}>Save</button>
          </>}
        >
          <div className="form-group">
            <label>Childhood Illness</label>
            <textarea className="form-control" value={historyForm.childhoodIllness || ''}
              onChange={e => setHistoryForm({...historyForm, childhoodIllness: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Psychiatric Illness</label>
            <textarea className="form-control" value={historyForm.psychiatricIllness || ''}
              onChange={e => setHistoryForm({...historyForm, psychiatricIllness: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Occupational Influences</label>
            <textarea className="form-control" value={historyForm.occupationalInfluences || ''}
              onChange={e => setHistoryForm({...historyForm, occupationalInfluences: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Operations / Surgeries</label>
            <textarea className="form-control" value={historyForm.operationsOrSurgeries || ''}
              onChange={e => setHistoryForm({...historyForm, operationsOrSurgeries: e.target.value})} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={historyForm.hereditary || false}
                onChange={e => setHistoryForm({...historyForm, hereditary: e.target.checked})} />
              Hereditary condition
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
