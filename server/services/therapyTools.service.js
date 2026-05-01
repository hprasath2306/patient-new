import { prisma } from "../prisma/client.js";

function parse(body) {
  const data = {};
  if (body.therapyId !== undefined) data.therapyId = Number(body.therapyId);
  if (body.mantras !== undefined) data.mantras = body.mantras;
  if (body.meditationTypes !== undefined) {
    data.meditationTypes = body.meditationTypes;
  }
  if (body.bandhas !== undefined) data.bandhas = body.bandhas;
  return data;
}

export async function getTherapyToolsById(id) {
  return prisma.therapyTools.findUnique({
    where: { id: Number(id) },
    include: {
      therapy: { select: { id: true, name: true, diseaseId: true } },
      yoga: true,
      pranayama: true,
      mudras: true,
      breathing: true,
    },
  });
}

export async function getTherapyToolsByTherapyId(therapyId) {
  return prisma.therapyTools.findUnique({
    where: { therapyId: Number(therapyId) },
    include: {
      yoga: true,
      pranayama: true,
      mudras: true,
      breathing: true,
    },
  });
}

export async function createTherapyTools(body) {
  const data = parse(body);
  if (data.therapyId == null) {
    const err = new Error("therapyId is required");
    err.statusCode = 400;
    throw err;
  }
  return prisma.therapyTools.create({ data });
}

export async function updateTherapyTools(id, body) {
  const data = parse(body);
  delete data.therapyId;
  return prisma.therapyTools.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteTherapyTools(id) {
  return prisma.therapyTools.delete({
    where: { id: Number(id) },
  });
}
