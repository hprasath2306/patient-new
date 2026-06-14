import * as medicalReportService from "../services/medicalReport.service.js";

export async function list(req, res) {
  const rows = await medicalReportService.listMedicalReports({
    diseaseId: req.query.diseaseId,
    medicalHistoryId: req.query.medicalHistoryId,
  });
  res.json(rows);
}

export async function getById(req, res) {
  const row = await medicalReportService.getMedicalReportById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Medical report not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const body = { ...req.body };

  if (req.file) {
    body.filePath = `/uploads/${req.file.filename}`;
    body.originalName = req.file.originalname;
  }

  const row = await medicalReportService.createMedicalReport(body);
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await medicalReportService.updateMedicalReport(
    req.params.id,
    req.body,
  );
  res.json(row);
}

export async function remove(req, res) {
  await medicalReportService.deleteMedicalReport(req.params.id);
  res.status(204).send();
}
