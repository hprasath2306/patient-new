import * as diseaseService from "../services/disease.service.js";

export async function listByPatient(req, res) {
  const rows = await diseaseService.listDiseasesByPatient(
    req.params.patientId,
  );
  res.json(rows);
}

export async function getById(req, res) {
  const row = await diseaseService.getDiseaseById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Disease not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const patientId = req.body?.patientId ?? req.params.patientId;
  if (patientId == null) {
    return res.status(400).json({ error: "patientId is required" });
  }
  const row = await diseaseService.createDisease({
    ...req.body,
    patientId,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await diseaseService.updateDisease(req.params.id, req.body);
  res.json(row);
}

export async function remove(req, res) {
  await diseaseService.deleteDisease(req.params.id);
  res.status(204).send();
}
