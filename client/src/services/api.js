import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Patients ──
export const getPatients = (include) =>
  api.get('/patients', { params: include ? { include } : {} }).then(r => r.data);

export const getPatient = (id) =>
  api.get(`/patients/${id}`).then(r => r.data);

export const createPatient = (data) =>
  api.post('/patients', data).then(r => r.data);

export const updatePatient = (id, data) =>
  api.patch(`/patients/${id}`, data).then(r => r.data);

export const deletePatient = (id) =>
  api.delete(`/patients/${id}`);

// ── Diseases ──
export const getDiseasesByPatient = (patientId) =>
  api.get(`/patients/${patientId}/diseases`).then(r => r.data);

export const getDisease = (id) =>
  api.get(`/diseases/${id}`).then(r => r.data);

export const createDisease = (patientId, data) =>
  api.post(`/patients/${patientId}/diseases`, data).then(r => r.data);

export const updateDisease = (id, data) =>
  api.patch(`/diseases/${id}`, data).then(r => r.data);

export const deleteDisease = (id) =>
  api.delete(`/diseases/${id}`);

// ── Medical History ──
export const getMedicalHistory = (patientId, diseaseId) =>
  api.get(`/patients/${patientId}/diseases/${diseaseId}/medical-history`).then(r => r.data);

export const createMedicalHistory = (patientId, diseaseId, data) =>
  api.post(`/patients/${patientId}/diseases/${diseaseId}/medical-history`, data).then(r => r.data);

export const updateMedicalHistory = (id, data) =>
  api.patch(`/medical-histories/${id}`, data).then(r => r.data);

export const deleteMedicalHistory = (id) =>
  api.delete(`/medical-histories/${id}`);

// ── Medical Reports ──
export const getMedicalReports = (params) =>
  api.get('/medical-reports', { params }).then(r => r.data);

export const getMedicalReport = (id) =>
  api.get(`/medical-reports/${id}`).then(r => r.data);

export const createMedicalReport = (file, { diseaseId, medicalHistoryId } = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (diseaseId) formData.append('diseaseId', diseaseId);
  if (medicalHistoryId) formData.append('medicalHistoryId', medicalHistoryId);
  return api.post('/medical-reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const updateMedicalReport = (id, data) =>
  api.patch(`/medical-reports/${id}`, data).then(r => r.data);

export const deleteMedicalReport = (id) =>
  api.delete(`/medical-reports/${id}`);

// ── Therapies ──
export const getTherapiesByDisease = (patientId, diseaseId) =>
  api.get(`/patients/${patientId}/diseases/${diseaseId}/therapies`).then(r => r.data);

export const getTherapy = (id) =>
  api.get(`/therapies/${id}`).then(r => r.data);

export const createTherapy = (patientId, diseaseId, data) =>
  api.post(`/patients/${patientId}/diseases/${diseaseId}/therapies`, data).then(r => r.data);

export const updateTherapy = (id, data) =>
  api.patch(`/therapies/${id}`, data).then(r => r.data);

export const deleteTherapy = (id) =>
  api.delete(`/therapies/${id}`);

// ── Therapy Tools ──
export const getTherapyTools = (patientId, diseaseId, therapyId) =>
  api.get(`/patients/${patientId}/diseases/${diseaseId}/therapies/${therapyId}/therapy-tools`).then(r => r.data);

export const createTherapyTools = (patientId, diseaseId, therapyId, data) =>
  api.post(`/patients/${patientId}/diseases/${diseaseId}/therapies/${therapyId}/therapy-tools`, data).then(r => r.data);

export const updateTherapyTools = (id, data) =>
  api.patch(`/therapy-tools/${id}`, data).then(r => r.data);

export const deleteTherapyTools = (id) =>
  api.delete(`/therapy-tools/${id}`);

// ── Modifiers (Yoga, Pranayama, Mudras, Breathing) ──
const modifierCrud = (base) => ({
  getAll: () => api.get(`/${base}`).then(r => r.data),
  getById: (id) => api.get(`/${base}/${id}`).then(r => r.data),
  getByToolsId: (toolsId) => api.get(`/${base}/by-therapy-tools/${toolsId}`).then(r => r.data),
  create: (data) => api.post(`/${base}`, data).then(r => r.data),
  update: (id, data) => api.patch(`/${base}/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/${base}/${id}`),
});

export const yogaApi = modifierCrud('yoga');
export const pranayamaApi = modifierCrud('pranayama');
export const mudrasApi = modifierCrud('mudras');
export const breathingApi = modifierCrud('breathing-exercises');

export default api;
