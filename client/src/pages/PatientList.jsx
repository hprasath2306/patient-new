import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Trash2, Users, Filter, Download } from 'lucide-react';
import { getPatients, deletePatient } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getPatients('diseases')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete patient "${name}"? This action cannot be undone.`)) return;
    try {
      await deletePatient(id);
      setToast({ msg: 'Patient deleted successfully', type: 'success' });
      load();
    } catch {
      setToast({ msg: 'Failed to delete patient', type: 'error' });
    }
  };

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.placeOfResidence?.toLowerCase().includes(search.toLowerCase());
    const matchGender = !genderFilter || p.gender?.toLowerCase() === genderFilter.toLowerCase();
    return matchSearch && matchGender;
  });

  if (loading) return <Loading />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>{patients.length} total patients registered</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/api/export/patients/excel" download className="btn btn-secondary">
            <Download size={16} /> Export Excel
          </a>
          <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
            <UserPlus size={16} /> Add Patient
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search />
            <input
              placeholder="Search patients by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 36px 8px 12px' }}
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Location</th>
                    <th>BMI</th>
                    <th>Active Cases</th>
                    <th>Registered</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <div className="avatar">
                            {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            {p.referencePerson && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Ref: {p.referencePerson}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{p.age} yrs</td>
                      <td><span className="badge badge-secondary">{p.gender}</span></td>
                      <td>{p.placeOfResidence || '—'}</td>
                      <td>
                        {p.bmi ? (
                          <span className={`badge ${p.bmi < 18.5 ? 'badge-warning' : p.bmi > 25 ? 'badge-danger' : 'badge-success'}`}>
                            {p.bmi.toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className="badge badge-primary">{p.diseases?.length || 0}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                            <Eye size={15} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id, p.name)}
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <h3>No patients found</h3>
              <p>{search ? 'Try adjusting your search terms' : 'Start by adding your first patient'}</p>
              {!search && (
                <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
                  <UserPlus size={16} /> Add First Patient
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
