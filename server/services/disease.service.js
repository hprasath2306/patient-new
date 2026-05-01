import { prisma } from "../prisma/client.js";

const diseaseScalar = {
  id: true,
  patientId: true,
  nameOfDisease: true,
  chiefComplaint: true,
  timePeriod: true,
  onsetOfDisease: true,
  symptoms: true,
  locationOfPain: true,
  severity: true,
  recurrenceTiming: true,
  aggravatingFactors: true,
  typeOfDisease: true,
  anatomicalReference: true,
  physiologicalReference: true,
  psychologicalReference: true,
};

function parseDisease(body, partial) {
  const data = {};
  const keys = Object.keys(diseaseScalar).filter((k) => k !== "id");
  for (const key of keys) {
    if (body[key] !== undefined) {
      if (key === "patientId") {
        data[key] = Number(body[key]);
      } else {
        data[key] = body[key];
      }
    }
  }
  return data;
}

export async function listDiseasesByPatient(patientId) {
  return prisma.disease.findMany({
    where: { patientId: Number(patientId) },
    orderBy: { id: "asc" },
  });
}

export async function getDiseaseById(id) {
  return prisma.disease.findUnique({
    where: { id: Number(id) },
    include: {
      patient: { select: { id: true, name: true, age: true, gender: true } },
      medicalHistory: true,
      therapies: {
        include: {
          therapyTools: {
            include: {
              yoga: true,
              pranayama: true,
              mudras: true,
              breathing: true,
            },
          },
        },
      },
      medicalReports: true,
    },
  });
}

export async function createDisease(body) {
  const data = parseDisease(body, false);
  return prisma.disease.create({ data });
}

export async function updateDisease(id, body) {
  const data = parseDisease(body, true);
  return prisma.disease.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteDisease(id) {
  return prisma.disease.delete({
    where: { id: Number(id) },
  });
}
