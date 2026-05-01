import { prisma } from "../prisma/client.js";

function parse(body, partial) {
  const data = {};
  if (body.filePath !== undefined) data.filePath = body.filePath;
  if (body.diseaseId !== undefined) {
    data.diseaseId =
      body.diseaseId === null ? null : Number(body.diseaseId);
  }
  if (body.medicalHistoryId !== undefined) {
    data.medicalHistoryId =
      body.medicalHistoryId === null ? null : Number(body.medicalHistoryId);
  }
  return data;
}

export async function listMedicalReports({ diseaseId, medicalHistoryId } = {}) {
  const where = {};
  if (diseaseId != null) where.diseaseId = Number(diseaseId);
  if (medicalHistoryId != null) {
    where.medicalHistoryId = Number(medicalHistoryId);
  }
  return prisma.medicalReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getMedicalReportById(id) {
  return prisma.medicalReport.findUnique({
    where: { id: Number(id) },
    include: {
      disease: { select: { id: true, nameOfDisease: true } },
      medicalHistory: { select: { id: true, diseaseId: true } },
    },
  });
}

export async function createMedicalReport(body) {
  const data = parse(body, false);
  if (!data.filePath) {
    const err = new Error("filePath is required");
    err.statusCode = 400;
    throw err;
  }
  return prisma.medicalReport.create({ data });
}

export async function updateMedicalReport(id, body) {
  const data = parse(body, true);
  return prisma.medicalReport.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteMedicalReport(id) {
  return prisma.medicalReport.delete({
    where: { id: Number(id) },
  });
}
