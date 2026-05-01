import { prisma } from "../prisma/client.js";

const patientSelect = {
  id: true,
  name: true,
  date: true,
  placeOfResidence: true,
  referencePerson: true,
  age: true,
  gender: true,
  natureOfWork: true,
  height: true,
  weight: true,
  bmi: true,
  sleepPatterns: true,
  diet: true,
  createdAt: true,
  updatedAt: true,
};

export async function listPatients({ includeDiseases = false } = {}) {
  return prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      ...patientSelect,
      ...(includeDiseases && {
        diseases: {
          select: { id: true, nameOfDisease: true, chiefComplaint: true },
        },
      }),
    },
  });
}

export async function getPatientById(id, { includeDiseases = true } = {}) {
  const where = { id: Number(id) };
  if (!includeDiseases) {
    return prisma.patient.findUnique({
      where,
      select: patientSelect,
    });
  }
  return prisma.patient.findUnique({
    where,
    include: {
      diseases: {
        include: {
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
      },
    },
  });
}

function parsePatientPayload(body, partial = false) {
  const data = {};
  const fields = [
    "name",
    "date",
    "placeOfResidence",
    "referencePerson",
    "age",
    "gender",
    "natureOfWork",
    "height",
    "weight",
    "bmi",
    "sleepPatterns",
    "diet",
  ];

  for (const key of fields) {
    if (body[key] !== undefined) {
      if (key === "age" && body[key] !== null) {
        data[key] = Number(body[key]);
      } else if (
        ["height", "weight", "bmi"].includes(key) &&
        body[key] !== null &&
        body[key] !== ""
      ) {
        data[key] = Number(body[key]);
      } else if (key === "date" && body[key]) {
        data[key] = new Date(body[key]);
      } else {
        data[key] = body[key];
      }
    } else if (!partial && ["name", "age", "gender"].includes(key)) {
      // required on create — validated in controller
    }
  }

  return data;
}

export async function createPatient(body) {
  const data = parsePatientPayload(body, false);
  return prisma.patient.create({ data });
}

export async function updatePatient(id, body) {
  const data = parsePatientPayload(body, true);
  return prisma.patient.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deletePatient(id) {
  return prisma.patient.delete({
    where: { id: Number(id) },
  });
}
