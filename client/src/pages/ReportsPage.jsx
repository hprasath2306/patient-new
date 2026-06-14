import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Trash2, Plus, Upload, Eye, Download } from 'lucide-react';
import { getPatients, getMedicalReports, createMedicalReport, deleteMedicalReport } from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import FileDropZone from '../components/FileDropZone';

const getFileName = (filePath) => {
  if (!filePath) return 'Unknown';
  return filePath.split('/').pop();
};

const isPreviewable = (filePath) => {
  const ext = filePath?.toLowerCase().split('.').pop();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt'].includes(ext);
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diseaseId, setDiseaseId] = useState('');
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [reps, pats] = await Promise.all([
        getMedicalReports(),
        getPatients('diseases'),
      ]);
      setReports(reps);
      setPatients(pats);
    } catch {
      setReports([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patientMap = {};
  patients.forEach(p =>
    (p.diseases || []).forEach(d => {
      patientMap[d.id] = { patientName: p.name, patientId: p.id, diseaseName: d.nameOfDisease };
    })
  );

  const enrichedReports = reports.map(r => ({
    ...r,
    patientName: r.disease?.patientId ? patients.find(p => p.id === r.disease.patientId)?.name : patientMap[r.diseaseId]?.patientName || '—',
    patientId: r.disease?.patientId || patientMap[r.diseaseId]?.patientId,
    diseaseName: r.disease?.nameOfDisease || patientMap[r.diseaseId]?.diseaseName || '—',
  }));

  const filtered = enrichedReports.filter(r =>
    getFileName(r.filePath).toLowerCase().includes(search.toLowerCase()) ||
    r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.diseaseName?.toLowerCase().includes(search.toLowerCase())
  );

  const allDiseases = patients.flatMap(p =>
    (p.diseases || []).map(d => ({ ...d, patientName: p.name }))
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
      load();
    } catch {
      setToast({ msg: 'Failed to upload report', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteMedicalReport(id);
      setToast({ msg: 'Report deleted', type: 'success' });
      load();
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

  if (loading) return <Loading />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Medical Reports</h1>
          <p>{reports.length} reports across all patients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Upload Report
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
            <Search />
            <input placeholder="Search reports..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Patient</th>
                  <th>Disease</th>
                  <th>Date Added</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                        onClick={() => handleView(r.filePath)}>
                        <div className="stat-icon success" style={{ width: 32, height: 32 }}>
                          <FileText size={16} />
                        </div>
                        <span style={{ fontWeight: 500, wordBreak: 'break-all', color: 'var(--primary)' }}>
                          {getFileName(r.filePath)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {r.patientId ? (
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => navigate(`/patients/${r.patientId}`)}>
                          {r.patientName}
                        </span>
                      ) : r.patientName}
                    </td>
                    <td><span className="badge badge-primary">{r.diseaseName || '—'}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" title="View" onClick={() => handleView(r.filePath)}>
                          <Eye size={15} />
                        </button>
                        <a href={r.filePath} download className="btn btn-ghost btn-sm" title="Download">
                          <Download size={15} />
                        </a>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete"
                          onClick={() => handleDelete(r.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Upload size={48} />
              <h3>No reports found</h3>
              <p>Upload medical reports and documents</p>
            </div>
          )}
        </div>
      </div>

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
              {allDiseases.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nameOfDisease || `Disease #${d.id}`} — {d.patientName}
                </option>
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
