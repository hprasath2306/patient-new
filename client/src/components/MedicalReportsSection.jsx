import { useState } from 'react';
import { Plus, FileText, Trash2, Eye, Upload, Download } from 'lucide-react';
import { createMedicalReport, deleteMedicalReport } from '../services/api';
import Modal from './Modal';
import Toast from './Toast';
import FileDropZone from './FileDropZone';

const getFileName = (filePath) => {
  if (!filePath) return 'Unknown';
  return filePath.split('/').pop();
};

const isPreviewable = (filePath) => {
  const ext = filePath?.toLowerCase().split('.').pop();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt'].includes(ext);
};

export default function MedicalReportsSection({ diseases, patientId, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diseaseId, setDiseaseId] = useState('');
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const allReports = diseases.flatMap(d =>
    (d.medicalReports || []).map(r => ({ ...r, diseaseName: d.nameOfDisease }))
  );

  const handleCreate = async () => {
    if (!selectedFile) {
      setToast({ msg: 'Please select a file', type: 'error' });
      return;
    }
    try {
      await createMedicalReport(selectedFile, {
        diseaseId: diseaseId ? parseInt(diseaseId) : undefined,
      });
      setShowModal(false);
      setSelectedFile(null);
      setDiseaseId('');
      setToast({ msg: 'Report uploaded successfully', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to upload report', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteMedicalReport(id);
      setToast({ msg: 'Report deleted', type: 'success' });
      onRefresh();
    } catch {
      setToast({ msg: 'Failed to delete', type: 'error' });
    }
  };

  const handleView = (filePath) => {
    if (isPreviewable(filePath)) {
      setPreviewUrl(filePath);
    } else {
      window.open(filePath, '_blank');
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem' }}>Medical Reports ({allReports.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Upload Report
        </button>
      </div>

      {allReports.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {allReports.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleView(r.filePath)}>
              <div className="card-body" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div className="stat-icon success" style={{ width: 40, height: 40 }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: 4, wordBreak: 'break-all' }}>
                      {getFileName(r.filePath)}
                    </h4>
                    {r.diseaseName && (
                      <span className="badge badge-primary" style={{ marginBottom: 4, display: 'inline-block' }}>{r.diseaseName}</span>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Added {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" title="View"
                      onClick={e => { e.stopPropagation(); handleView(r.filePath); }}>
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete"
                      onClick={e => { e.stopPropagation(); handleDelete(r.id); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Upload size={48} />
          <h3>No medical reports</h3>
          <p>Upload medical documents and reports for this patient</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Upload Report
          </button>
        </div>
      )}

      {showModal && (
        <Modal title="Upload Medical Report" onClose={() => { setShowModal(false); setSelectedFile(null); setDiseaseId(''); }}
          footer={<>
            <button className="btn btn-secondary" onClick={() => { setShowModal(false); setSelectedFile(null); setDiseaseId(''); }}>Cancel</button>
            <button className="btn btn-primary" disabled={!selectedFile} onClick={handleCreate}>
              <Upload size={14} /> Upload Report
            </button>
          </>}
        >
          <div className="form-group">
            <label>Select File *</label>
            <FileDropZone
              file={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => setSelectedFile(null)}
            />
          </div>
          <div className="form-group">
            <label>Related Disease</label>
            <select className="form-control" value={diseaseId}
              onChange={e => setDiseaseId(e.target.value)}>
              <option value="">Select (optional)</option>
              {diseases.map(d => (
                <option key={d.id} value={d.id}>{d.nameOfDisease || `Disease #${d.id}`}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal" style={{ maxWidth: 900, width: '95%', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getFileName(previewUrl)}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={previewUrl} download className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>
                  <Download size={14} /> Download
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreviewUrl(null)}>Close</button>
              </div>
            </div>
            <div style={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, background: '#f1f5f9' }}>
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={previewUrl} alt="Report" style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
              ) : previewUrl.match(/\.pdf$/i) ? (
                <iframe src={previewUrl} style={{ width: '100%', height: '75vh', border: 'none' }} title="PDF Preview" />
              ) : (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Preview not available for this file type</p>
                  <a href={previewUrl} download className="btn btn-primary" style={{ marginTop: 12 }}>
                    <Download size={16} /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
