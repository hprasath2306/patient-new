import { useEffect, useState } from 'react';
import {
  HardDrive, Download, Upload, AlertTriangle, CheckCircle2,
  Database, Users, Activity, Stethoscope, FileText, Package, Info
} from 'lucide-react';
import api from '../services/api';
import FileDropZone from '../components/FileDropZone';
import Toast from '../components/Toast';

export default function DataMigration() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmImport, setConfirmImport] = useState(false);

  const loadStats = () => {
    setLoading(true);
    api.get('/export/migration/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/export/migration/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `holisticcare-backup-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ msg: 'Backup exported successfully!', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to export backup', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await api.post('/export/migration/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data);
      setImportFile(null);
      setConfirmImport(false);
      setToast({ msg: 'Data imported successfully!', type: 'success' });
      loadStats();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to import data';
      setToast({ msg, type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Data Migration</h1>
          <p>Export and import your entire clinic data for backup or PC migration</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px', marginBottom: 24, borderRadius: 'var(--radius-sm)',
        background: 'var(--info-bg)', border: '1px solid #bfdbfe',
        display: 'flex', gap: 12, alignItems: 'flex-start'
      }}>
        <Info size={20} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
          <strong>Moving to a new PC?</strong> Export your data as a backup ZIP on this machine, copy the file
          to your new machine, install the app there, and import the ZIP. All patients, diseases, therapies,
          reports, and uploaded files will be restored.
        </div>
      </div>

      {/* Current Data Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon primary"><Users size={20} /></div>
            <div className="stat-info"><h3>{stats.patients}</h3><p>Patients</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon secondary"><Activity size={20} /></div>
            <div className="stat-info"><h3>{stats.diseases}</h3><p>Disease Records</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accent"><Stethoscope size={20} /></div>
            <div className="stat-info"><h3>{stats.therapies}</h3><p>Therapies</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><FileText size={20} /></div>
            <div className="stat-info">
              <h3>{stats.reports}</h3>
              <p>Reports ({stats.uploadCount} files, {formatBytes(stats.uploadSize)})</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

        {/* Export Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} /> Export Backup
            </h3>
          </div>
          <div className="card-body">
            <div style={{
              padding: 24, borderRadius: 'var(--radius-sm)', background: 'var(--bg)',
              textAlign: 'center', marginBottom: 20
            }}>
              <Package size={48} style={{ color: 'var(--primary)', marginBottom: 12 }} />
              <h4 style={{ marginBottom: 8 }}>Full Data Export</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Downloads a ZIP file containing:
              </p>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left', maxWidth: 280, margin: '8px auto', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> All patient records & profiles
                </li>
                <li style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Disease records & medical history
                </li>
                <li style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Therapies & therapy tools
                </li>
                <li style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Uploaded medical report files
                </li>
              </ul>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleExport}
              disabled={exporting}
            >
              <Download size={18} />
              {exporting ? 'Preparing backup...' : 'Export Full Backup (.zip)'}
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={18} /> Import Backup
            </h3>
          </div>
          <div className="card-body">
            {importResult ? (
              <div style={{
                padding: 24, borderRadius: 'var(--radius-sm)',
                background: 'var(--success-bg)', border: '1px solid #a7f3d0',
                textAlign: 'center', marginBottom: 20
              }}>
                <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: 12 }} />
                <h4 style={{ marginBottom: 12 }}>Import Successful!</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                  <div><strong>{importResult.stats.patients}</strong> patients</div>
                  <div><strong>{importResult.stats.diseases}</strong> diseases</div>
                  <div><strong>{importResult.stats.therapies}</strong> therapies</div>
                  <div><strong>{importResult.stats.reports}</strong> reports</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>{importResult.uploadedFiles}</strong> uploaded files restored
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Select Backup File (.zip)</label>
                  <FileDropZone
                    file={importFile}
                    onFileSelect={setImportFile}
                    onClear={() => { setImportFile(null); setConfirmImport(false); }}
                    accept=".zip"
                  />
                </div>

                {importFile && !confirmImport && (
                  <div style={{
                    padding: '14px 16px', marginBottom: 16, borderRadius: 'var(--radius-sm)',
                    background: 'var(--warning-bg)', border: '1px solid #fde68a',
                    display: 'flex', gap: 10, alignItems: 'flex-start'
                  }}>
                    <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                      <strong>Warning:</strong> Importing will replace ALL existing data in this application
                      with the data from the backup file. This cannot be undone. Make sure to export a backup first
                      if you want to keep the current data.
                    </div>
                  </div>
                )}
              </>
            )}

            {importFile && !importResult && (
              !confirmImport ? (
                <button
                  className="btn btn-danger btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setConfirmImport(true)}
                >
                  <AlertTriangle size={18} /> I understand, proceed with import
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--danger)', textAlign: 'center', fontWeight: 600 }}>
                    Are you absolutely sure? All current data will be replaced.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-lg"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => { setConfirmImport(false); setImportFile(null); }}
                      disabled={importing}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger btn-lg"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={handleImport}
                      disabled={importing}
                    >
                      <Upload size={18} />
                      {importing ? 'Importing...' : 'Yes, Import Now'}
                    </button>
                  </div>
                </div>
              )
            )}

            {importResult && (
              <button
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setImportResult(null)}
              >
                Import Another Backup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How-to Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive size={18} /> How to Migrate to a New PC
          </h3>
        </div>
        <div className="card-body">
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <h4>Step 1: Export on Old PC</h4>
                <p>Click "Export Full Backup" above to download a ZIP file with all your data</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{ background: 'var(--secondary)' }} />
              <div className="timeline-content">
                <h4>Step 2: Transfer the ZIP</h4>
                <p>Copy the downloaded ZIP file to your new PC (USB drive, cloud storage, etc.)</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{ background: 'var(--accent)' }} />
              <div className="timeline-content">
                <h4>Step 3: Install on New PC</h4>
                <p>Set up the HolisticCare application on the new PC (npm install, etc.)</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{ background: 'var(--success)' }} />
              <div className="timeline-content">
                <h4>Step 4: Import on New PC</h4>
                <p>Open this page, upload the ZIP file, and click Import. All done!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
