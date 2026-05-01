import * as medicalHistoryService from "../services/medicalHistory.service.js";

export async function getById(req, res) {
  const row = await medicalHistoryService.getMedicalHistoryById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Medical history not found" });
  }
  res.json(row);
}

export async function getByDisease(req, res) {
  const row = await medicalHistoryService.getMedicalHistoryByDiseaseId(
    req.params.diseaseId,
  );
  if (!row) {
    return res.status(404).json({ error: "Medical history not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const diseaseId = req.body?.diseaseId ?? req.params.diseaseId;
  if (diseaseId == null) {
    return res.status(400).json({ error: "diseaseId is required" });
  }
  const row = await medicalHistoryService.createMedicalHistory({
    ...req.body,
    diseaseId,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await medicalHistoryService.updateMedicalHistory(
    req.params.id,
    req.body,
  );
  res.json(row);
}

export async function remove(req, res) {
  await medicalHistoryService.deleteMedicalHistory(req.params.id);
  res.status(204).send();
}
