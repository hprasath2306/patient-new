import * as therapyToolsService from "../services/therapyTools.service.js";

export async function getById(req, res) {
  const row = await therapyToolsService.getTherapyToolsById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Therapy tools not found" });
  }
  res.json(row);
}

export async function getByTherapy(req, res) {
  const row = await therapyToolsService.getTherapyToolsByTherapyId(
    req.params.therapyId,
  );
  if (!row) {
    return res.status(404).json({ error: "Therapy tools not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const therapyId = req.body?.therapyId ?? req.params.therapyId;
  if (therapyId == null) {
    return res.status(400).json({ error: "therapyId is required" });
  }
  const row = await therapyToolsService.createTherapyTools({
    ...req.body,
    therapyId,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await therapyToolsService.updateTherapyTools(
    req.params.id,
    req.body,
  );
  res.json(row);
}

export async function remove(req, res) {
  await therapyToolsService.deleteTherapyTools(req.params.id);
  res.status(204).send();
}
