import { prisma } from "../prisma/client.js";

function parse(body) {
  const data = {};
  if (body.diseaseId !== undefined) {
    data.diseaseId = Number(body.diseaseId);
  }
  for (const key of [
    "childhoodIllness",
    "psychiatricIllness",
    "occupationalInfluences",
    "operationsOrSurgeries",
    "hereditary",
  ]) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }
  return data;
}

export async function getMedicalHistoryById(id) {
  return prisma.medicalHistory.findUnique({
    where: { id: Number(id) },
    include: {
      disease: { select: { id: true, nameOfDisease: true, patientId: true } },
      medicalReports: true,
    },
  });
}

export async function getMedicalHistoryByDiseaseId(diseaseId) {
  return prisma.medicalHistory.findUnique({
    where: { diseaseId: Number(diseaseId) },
    include: { medicalReports: true },
  });
}

export async function createMedicalHistory(body) {
  const data = parse(body);
  return prisma.medicalHistory.create({ data });
}

export async function updateMedicalHistory(id, body) {
  const data = parse(body);
  delete data.diseaseId;
  return prisma.medicalHistory.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteMedicalHistory(id) {
  return prisma.medicalHistory.delete({
    where: { id: Number(id) },
  });
}
