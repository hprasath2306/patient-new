import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Search, AlertTriangle, Clock,
  ChevronRight, Activity
} from 'lucide-react';
import { getPatients } from '../services/api';
import Loading from '../components/Loading';

const severityColors = {
  Mild: 'badge-success',
  Moderate: 'badge-warning',
  Severe: 'badge-danger',
  Critical: 'badge-danger',
};

export default function DiseasesPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients('all')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const allDiseases = patients.flatMap(p =>
    (p.diseases || []).map(d => ({
      ...d, patientName: p.name, patientId: p.id,
      therapyCount: d.therapies?.length || 0,
      hasHistory: !!d.medicalHistory,
      reportCount: d.medicalReports?.length || 0,
    }))
  );

  const filtered = allDiseases.filter(d => {
    const matchSearch =
      (d.nameOfDisease || '').toLowerCase().includes(search.toLowerCase()) ||
      d.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (d.symptoms || '').toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severityFilter || d.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const severityCounts = {
    Mild: allDiseases.filter(d => d.severity === 'Mild').length,
    Moderate: allDiseases.filter(d => d.severity === 'Moderate').length,
    Severe: allDiseases.filter(d => d.severity === 'Severe').length,
    Critical: allDiseases.filter(d => d.severity === 'Critical').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Disease Records</h1>
          <p>{allDiseases.length} total disease records</p>
        </div>
      </div>

      <div className="stats-grid">
        {Object.entries(severityCounts).map(([level, count]) => (
          <div key={level} className="stat-card" style={{ cursor: 'pointer' }}
            onClick={() => setSeverityFilter(severityFilter === level ? '' : level)}>
            <div className={`stat-icon ${level === 'Mild' ? 'success' : level === 'Moderate' ? 'accent' : 'secondary'}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="stat-info">
              <h3>{count}</h3>
              <p>{level} Cases</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search />
            <input placeholder="Search diseases, patients, symptoms..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {severityFilter && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSeverityFilter('')}>
              Clear: {severityFilter}
            </button>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Disease</th>
                  <th>Patient</th>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Therapies</th>
                  <th>History</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="stat-icon secondary" style={{ width: 32, height: 32 }}>
                          <Activity size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{d.nameOfDisease || 'Unnamed'}</div>
                          {d.chiefComplaint && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {d.chiefComplaint}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/patients/${d.patientId}`)}>
                        {d.patientName}
                      </span>
                    </td>
                    <td>
                      {d.severity ? (
                        <span className={`badge ${severityColors[d.severity] || 'badge-secondary'}`}>
                          {d.severity}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {d.typeOfDisease ? (
                        <span className="badge badge-info">{d.typeOfDisease}</span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {d.timePeriod || '—'}
                    </td>
                    <td><span className="badge badge-primary">{d.therapyCount}</span></td>
                    <td>
                      {d.hasHistory ? (
                        <span className="badge badge-success">Recorded</span>
                      ) : (
                        <span className="badge badge-secondary">None</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/patients/${d.patientId}`)}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>No disease records found</h3>
              <p>Disease records appear when added to patients</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
