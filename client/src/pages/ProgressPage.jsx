import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Activity, Users, CheckCircle2,
  ChevronRight, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getPatients } from '../services/api';
import Loading from '../components/Loading';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];

export default function ProgressPage() {
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

  const patientStats = patients.map(p => {
    const diseases = p.diseases || [];
    const therapies = diseases.flatMap(d => d.therapies || []);
    const reports = diseases.flatMap(d => d.medicalReports || []);
    const withProgress = therapies.filter(t => t.progressiveReport);
    return {
      ...p,
      diseaseCount: diseases.length,
      therapyCount: therapies.length,
      reportCount: reports.length,
      progressCount: withProgress.length,
      hasTools: therapies.some(t => t.therapyTools),
    };
  }).filter(p => p.diseaseCount > 0);

  const severityData = [
    { name: 'Mild', value: 0, fill: '#10b981' },
    { name: 'Moderate', value: 0, fill: '#f59e0b' },
    { name: 'Severe', value: 0, fill: '#ef4444' },
    { name: 'Critical', value: 0, fill: '#dc2626' },
  ];
  patients.forEach(p =>
    (p.diseases || []).forEach(d => {
      const entry = severityData.find(s => s.name === d.severity);
      if (entry) entry.value++;
    })
  );

  const therapyTypeData = [
    { name: 'Therapy', count: 0 },
    { name: 'Fitness', count: 0 },
  ];
  patients.forEach(p =>
    (p.diseases || []).forEach(d =>
      (d.therapies || []).forEach(t => {
        const entry = therapyTypeData.find(x => x.name === t.fitnessOrTherapy);
        if (entry) entry.count++;
      })
    )
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Progress Tracking</h1>
          <p>Monitor patient recovery and therapy effectiveness</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Users size={20} /></div>
          <div className="stat-info"><h3>{patientStats.length}</h3><p>Active Patients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary"><Activity size={20} /></div>
          <div className="stat-info">
            <h3>{patientStats.reduce((s, p) => s + p.therapyCount, 0)}</h3>
            <p>Total Therapies</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <h3>{patientStats.reduce((s, p) => s + p.progressCount, 0)}</h3>
            <p>Progress Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <h3>{patientStats.filter(p => p.hasTools).length}</h3>
            <p>With Therapy Tools</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Severity Distribution</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            {severityData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={severityData.filter(d => d.value > 0)} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {severityData.filter(d => d.value > 0).map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}><p>No severity data</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Therapy Types</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={therapyTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Patient Progress Overview</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {patientStats.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Diseases</th>
                  <th>Therapies</th>
                  <th>Progress Reports</th>
                  <th>Medical Reports</th>
                  <th>Tools Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patientStats.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">
                          {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-secondary">{p.diseaseCount}</span></td>
                    <td><span className="badge badge-primary">{p.therapyCount}</span></td>
                    <td><span className="badge badge-success">{p.progressCount}</span></td>
                    <td><span className="badge badge-info">{p.reportCount}</span></td>
                    <td>
                      {p.hasTools ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-secondary">None</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <TrendingUp size={48} />
              <h3>No active cases</h3>
              <p>Progress tracking starts when patients have disease records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
