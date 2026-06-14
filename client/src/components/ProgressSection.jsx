import { TrendingUp, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';

export default function ProgressSection({ diseases, patient }) {
  const allTherapies = diseases.flatMap(d =>
    (d.therapies || []).map(t => ({ ...t, disease: d }))
  );

  const timelineItems = [
    ...diseases.map(d => ({
      type: 'disease', date: new Date(), title: `Disease: ${d.nameOfDisease || 'Unnamed'}`,
      desc: `Severity: ${d.severity || 'N/A'} | Type: ${d.typeOfDisease || 'N/A'}`,
      severity: d.severity,
    })),
    ...allTherapies.map(t => ({
      type: 'therapy', date: new Date(t.createdAt), title: `Therapy: ${t.name}`,
      desc: t.progressiveReport || `${t.fitnessOrTherapy} for ${t.disease.nameOfDisease || 'disease'}`,
    })),
  ].sort((a, b) => b.date - a.date);

  const therapyToolsCounts = allTherapies.reduce(
    (acc, t) => {
      if (!t.therapyTools) return acc;
      if (t.therapyTools.yoga) acc.Yoga++;
      if (t.therapyTools.pranayama) acc.Pranayama++;
      if (t.therapyTools.mudras) acc.Mudras++;
      if (t.therapyTools.breathing) acc.Breathing++;
      if (t.therapyTools.mantras) acc.Mantras++;
      if (t.therapyTools.meditationTypes) acc.Meditation++;
      if (t.therapyTools.bandhas) acc.Bandhas++;
      return acc;
    },
    { Yoga: 0, Pranayama: 0, Mudras: 0, Breathing: 0, Mantras: 0, Meditation: 0, Bandhas: 0 }
  );

  const radarData = Object.entries(therapyToolsCounts).map(([name, value]) => ({ name, value }));

  const severityCounts = { Mild: 0, Moderate: 0, Severe: 0, Critical: 0 };
  diseases.forEach(d => {
    if (d.severity && severityCounts[d.severity] !== undefined) severityCounts[d.severity]++;
  });
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Progress & Analytics</h3>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon primary"><Activity size={20} /></div>
          <div className="stat-info"><h3>{diseases.length}</h3><p>Active Conditions</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent"><CheckCircle2 size={20} /></div>
          <div className="stat-info"><h3>{allTherapies.length}</h3><p>Therapies Applied</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <h3>{allTherapies.filter(t => t.progressiveReport).length}</h3>
            <p>Progress Reports</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3>Therapy Tools Coverage</h3></div>
          <div className="card-body">
            {radarData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" fontSize={11} tick={{ fill: '#64748b' }} />
                  <PolarRadiusAxis fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <Radar dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No therapy tools data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Disease Severity Distribution</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 5 }} name="Cases" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3><Clock size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Treatment Timeline</h3>
        </div>
        <div className="card-body">
          {timelineItems.length > 0 ? (
            <div className="timeline">
              {timelineItems.map((item, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" style={{
                    background: item.type === 'therapy' ? 'var(--primary)' :
                      item.severity === 'Severe' || item.severity === 'Critical' ? 'var(--danger)' :
                      item.severity === 'Moderate' ? 'var(--warning)' : 'var(--success)'
                  }} />
                  <div className="timeline-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <span className="timeline-date">{item.date.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {allTherapies.filter(t => t.progressiveReport).length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><h3>Therapist Notes & Progress</h3></div>
          <div className="card-body">
            {allTherapies.filter(t => t.progressiveReport).map(t => (
              <div key={t.id} style={{ marginBottom: 16, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ fontSize: '0.85rem' }}>{t.name}</h4>
                  <span className="badge badge-secondary">{t.disease.nameOfDisease}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {t.progressiveReport}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
