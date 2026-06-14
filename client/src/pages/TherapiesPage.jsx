import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Search, Dumbbell, Wind, Hand, Brain,
  Music, Zap, ChevronRight
} from 'lucide-react';
import { getPatients } from '../services/api';
import Loading from '../components/Loading';

const toolIcons = {
  yoga: Dumbbell, pranayama: Wind, mudras: Hand,
  breathing: Wind, mantras: Music, meditation: Brain, bandhas: Zap
};

export default function TherapiesPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients('all')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const allTherapies = patients.flatMap(p =>
    (p.diseases || []).flatMap(d =>
      (d.therapies || []).map(t => ({
        ...t, patientName: p.name, patientId: p.id,
        diseaseName: d.nameOfDisease, diseaseId: d.id,
      }))
    )
  );

  const filtered = allTherapies.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.diseaseName?.toLowerCase().includes(search.toLowerCase())
  );

  const toolStats = {
    yoga: allTherapies.filter(t => t.therapyTools?.yoga).length,
    pranayama: allTherapies.filter(t => t.therapyTools?.pranayama).length,
    mudras: allTherapies.filter(t => t.therapyTools?.mudras).length,
    breathing: allTherapies.filter(t => t.therapyTools?.breathing).length,
    mantras: allTherapies.filter(t => t.therapyTools?.mantras).length,
    meditation: allTherapies.filter(t => t.therapyTools?.meditationTypes).length,
    bandhas: allTherapies.filter(t => t.therapyTools?.bandhas).length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Therapy Management</h1>
          <p>{allTherapies.length} therapies across all patients</p>
        </div>
      </div>

      <h3 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Therapy Tools Overview</h3>
      <div className="therapy-tools-grid" style={{ marginBottom: 24 }}>
        {Object.entries(toolStats).map(([key, count]) => {
          const Icon = toolIcons[key];
          return (
            <div key={key} className={`tool-card ${count > 0 ? 'active' : ''}`}>
              <Icon size={28} />
              <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              <p>{count} active</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Therapies</h3>
          <div className="search-bar">
            <Search />
            <input placeholder="Search therapies..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Therapy</th>
                  <th>Patient</th>
                  <th>Disease</th>
                  <th>Type</th>
                  <th>Tools</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                    <td>
                      <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/patients/${t.patientId}`)}>
                        {t.patientName}
                      </span>
                    </td>
                    <td><span className="badge badge-primary">{t.diseaseName || '—'}</span></td>
                    <td><span className={`badge ${t.fitnessOrTherapy === 'Fitness' ? 'badge-info' : 'badge-success'}`}>{t.fitnessOrTherapy}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {t.therapyTools?.yoga && <Dumbbell size={14} style={{ color: 'var(--primary)' }} />}
                        {t.therapyTools?.pranayama && <Wind size={14} style={{ color: 'var(--secondary)' }} />}
                        {t.therapyTools?.mudras && <Hand size={14} style={{ color: 'var(--accent)' }} />}
                        {t.therapyTools?.breathing && <Wind size={14} style={{ color: 'var(--success)' }} />}
                        {!t.therapyTools && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${t.patientId}`)}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Stethoscope size={48} />
              <h3>No therapies found</h3>
              <p>Therapies will appear when prescribed to patients</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
