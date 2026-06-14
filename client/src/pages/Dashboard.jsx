import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Stethoscope, FileText, Activity,
  TrendingUp, Calendar, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { getPatients } from '../services/api';
import Loading from '../components/Loading';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients('all')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const totalPatients = patients.length;
  const totalDiseases = patients.reduce((sum, p) => sum + (p.diseases?.length || 0), 0);
  const totalTherapies = patients.reduce(
    (sum, p) => sum + (p.diseases?.reduce((s, d) => s + (d.therapies?.length || 0), 0) || 0), 0
  );
  const totalReports = patients.reduce(
    (sum, p) => sum + (p.diseases?.reduce((s, d) => s + (d.medicalReports?.length || 0), 0) || 0), 0
  );

  const genderData = ['Male', 'Female', 'Other'].map(g => ({
    name: g,
    value: patients.filter(p => p.gender?.toLowerCase() === g.toLowerCase()).length,
  })).filter(d => d.value > 0);

  const ageGroups = [
    { name: '0-18', min: 0, max: 18 },
    { name: '19-30', min: 19, max: 30 },
    { name: '31-45', min: 31, max: 45 },
    { name: '46-60', min: 46, max: 60 },
    { name: '60+', min: 61, max: 200 },
  ];
  const ageData = ageGroups.map(g => ({
    name: g.name,
    patients: patients.filter(p => p.age >= g.min && p.age <= g.max).length,
  }));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const registrationData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = patients.filter(p => {
      const pd = new Date(p.createdAt);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    }).length;
    registrationData.push({ name: monthNames[d.getMonth()], patients: count });
  }

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome Back</h1>
          <p>Here's an overview of your therapy center</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
          <Users size={16} /> Add Patient
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Users size={24} /></div>
          <div className="stat-info">
            <h3>{totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>{totalDiseases}</h3>
            <p>Active Cases</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent"><Stethoscope size={24} /></div>
          <div className="stat-info">
            <h3>{totalTherapies}</h3>
            <p>Therapies Prescribed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FileText size={24} /></div>
          <div className="stat-info">
            <h3>{totalReports}</h3>
            <p>Medical Reports</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Patient Registrations</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Area
                  type="monotone" dataKey="patients" stroke="#0d9488"
                  fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Users size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Gender Distribution</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={genderData} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No patient data yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Calendar size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Age Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="patients" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Patients</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentPatients.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map(p => (
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">
                          {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        {p.name}
                      </td>
                      <td>{p.age}</td>
                      <td>
                        <span className="badge badge-secondary">{p.gender}</span>
                      </td>
                      <td>{p.diseases?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No patients registered yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
