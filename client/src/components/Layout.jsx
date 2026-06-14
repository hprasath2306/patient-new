import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, FileText, Activity,
  Menu, X, Heart, ClipboardList, HardDrive
} from 'lucide-react';

const navItems = [
  { label: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, text: 'Dashboard' },
  ]},
  { label: 'Management', items: [
    { to: '/patients', icon: Users, text: 'Patients' },
    { to: '/therapies', icon: Stethoscope, text: 'Therapies' },
    { to: '/reports', icon: FileText, text: 'Medical Reports' },
  ]},
  { label: 'Clinical', items: [
    { to: '/diseases', icon: ClipboardList, text: 'Disease Records' },
    { to: '/progress', icon: Activity, text: 'Progress Tracking' },
  ]},
  { label: 'System', items: [
    { to: '/data-migration', icon: HardDrive, text: 'Data Migration' },
  ]},
];

const pageNames = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/patients/new': 'New Patient',
  '/therapies': 'Therapy Management',
  '/reports': 'Medical Reports',
  '/diseases': 'Disease Records',
  '/progress': 'Progress Tracking',
  '/data-migration': 'Data Migration',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (pageNames[path]) return pageNames[path];
    if (path.startsWith('/patients/') && path.includes('/diseases/')) return 'Disease Details';
    if (path.startsWith('/patients/') && path.includes('/therapies/')) return 'Therapy Details';
    if (path.startsWith('/patients/')) return 'Patient Details';
    return 'Holistic Therapy';
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>
            <Heart size={22} />
            <span>Holistic</span>Care
          </h1>
          <p>Therapy & Patient Management</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon />
                  {item.text}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="topbar-right">
            <div className="avatar" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem' }}>
              TC
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
