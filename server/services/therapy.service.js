import { prisma } from "../prisma/client.js";

function parse(body) {
  const data = {};
  if (body.diseaseId !== undefined) data.diseaseId = Number(body.diseaseId);
  const strings = [
    "name",
    "fitnessOrTherapy",
    "homeRemedies",
    "dietReference",
    "lifestyleModifications",
    "secondaryTherapy",
    "aggravatingPoses",
    "relievingPoses",
    "flexibilityLevel",
    "nerveStiffness",
    "muscleStiffness",
    "avoidablePoses",
    "therapyPoses",
    "sideEffects",
    "progressiveReport",
  ];
  for (const key of strings) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

export async function listTherapiesByDisease(diseaseId) {
  return prisma.therapy.findMany({
    where: { diseaseId: Number(diseaseId) },
    orderBy: { createdAt: "desc" },
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
  });
}

export async function getTherapyById(id) {
  return prisma.therapy.findUnique({
    where: { id: Number(id) },
    include: {
      disease: { select: { id: true, nameOfDisease: true, patientId: true } },
      therapyTools: {
        include: {
          yoga: true,
          pranayama: true,
          mudras: true,
          breathing: true,
        },
      },
    },
  });
}

export async function createTherapy(body) {
  const data = parse(body);
  if (!data.name || !data.fitnessOrTherapy || data.diseaseId == null) {
    const err = new Error("name, fitnessOrTherapy, and diseaseId are required");
    err.statusCode = 400;
    throw err;
  }
  return prisma.therapy.create({ data });
}

export async function updateTherapy(id, body) {
  const data = parse(body);
  delete data.diseaseId;
  return prisma.therapy.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteTherapy(id) {
  return prisma.therapy.delete({
    where: { id: Number(id) },
  });
}
