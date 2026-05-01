import * as therapyService from "../services/therapy.service.js";

export async function listByDisease(req, res) {
  const rows = await therapyService.listTherapiesByDisease(req.params.diseaseId);
  res.json(rows);
}

export async function getById(req, res) {
  const row = await therapyService.getTherapyById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Therapy not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const diseaseId = req.body?.diseaseId ?? req.params.diseaseId;
  if (diseaseId == null) {
    return res.status(400).json({ error: "diseaseId is required" });
  }
  const row = await therapyService.createTherapy({
    ...req.body,
    diseaseId,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await therapyService.updateTherapy(req.params.id, req.body);
  res.json(row);
}

export async function remove(req, res) {
  await therapyService.deleteTherapy(req.params.id);
  res.status(204).send();
}
