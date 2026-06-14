import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';
import PatientDetail from './pages/PatientDetail';
import TherapiesPage from './pages/TherapiesPage';
import ReportsPage from './pages/ReportsPage';
import DiseasesPage from './pages/DiseasesPage';
import ProgressPage from './pages/ProgressPage';
import DataMigration from './pages/DataMigration';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/therapies" element={<TherapiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/diseases" element={<DiseasesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/data-migration" element={<DataMigration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
