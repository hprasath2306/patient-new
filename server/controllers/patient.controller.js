import * as patientService from "../services/patient.service.js";

export async function list(req, res) {
  const includeDiseases =
    req.query.include === "diseases" || req.query.include === "all";
  const rows = await patientService.listPatients({ includeDiseases });
  res.json(rows);
}

export async function getById(req, res) {
  const includeDiseases = req.query.shallow === "1" ? false : true;
  const row = await patientService.getPatientById(req.params.id, {
    includeDiseases,
  });
  if (!row) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(row);
}

export async function create(req, res) {
  const { name, age, gender } = req.body ?? {};
  if (!name || age == null || !gender) {
    return res
      .status(400)
      .json({ error: "name, age, and gender are required" });
  }
  const row = await patientService.createPatient(req.body);
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await patientService.updatePatient(req.params.id, req.body);
  res.json(row);
}

export async function remove(req, res) {
  await patientService.deletePatient(req.params.id);
  res.status(204).send();
}
