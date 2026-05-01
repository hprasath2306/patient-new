import { prisma } from "../prisma/client.js";

function requireTherapyToolsId(body) {
  if (body.therapyToolsId == null) {
    const err = new Error("therapyToolsId is required");
    err.statusCode = 400;
    throw err;
  }
  return Number(body.therapyToolsId);
}

export const yogaService = {
  async getById(id) {
    return prisma.yoga.findUnique({ where: { id: Number(id) } });
  },
  async getByTherapyToolsId(therapyToolsId) {
    return prisma.yoga.findUnique({
      where: { therapyToolsId: Number(therapyToolsId) },
    });
  },
  async create(body) {
    const therapyToolsId = requireTherapyToolsId(body);
    return prisma.yoga.create({
      data: {
        therapyToolsId,
        poses: body.poses ?? null,
        repeatingTimingsPerDay:
          body.repeatingTimingsPerDay != null
            ? Number(body.repeatingTimingsPerDay)
            : null,
      },
    });
  },
  async update(id, body) {
    const data = {};
    if (body.poses !== undefined) data.poses = body.poses;
    if (body.repeatingTimingsPerDay !== undefined) {
      data.repeatingTimingsPerDay =
        body.repeatingTimingsPerDay == null
          ? null
          : Number(body.repeatingTimingsPerDay);
    }
    return prisma.yoga.update({ where: { id: Number(id) }, data });
  },
  async remove(id) {
    return prisma.yoga.delete({ where: { id: Number(id) } });
  },
};

export const pranayamaService = {
  async getById(id) {
    return prisma.pranayama.findUnique({ where: { id: Number(id) } });
  },
  async getByTherapyToolsId(therapyToolsId) {
    return prisma.pranayama.findUnique({
      where: { therapyToolsId: Number(therapyToolsId) },
    });
  },
  async create(body) {
    const therapyToolsId = requireTherapyToolsId(body);
    return prisma.pranayama.create({
      data: {
        therapyToolsId,
        techniques: body.techniques ?? null,
        repeatingTimingsPerDay:
          body.repeatingTimingsPerDay != null
            ? Number(body.repeatingTimingsPerDay)
            : null,
      },
    });
  },
  async update(id, body) {
    const data = {};
    if (body.techniques !== undefined) data.techniques = body.techniques;
    if (body.repeatingTimingsPerDay !== undefined) {
      data.repeatingTimingsPerDay =
        body.repeatingTimingsPerDay == null
          ? null
          : Number(body.repeatingTimingsPerDay);
    }
    return prisma.pranayama.update({ where: { id: Number(id) }, data });
  },
  async remove(id) {
    return prisma.pranayama.delete({ where: { id: Number(id) } });
  },
};

export const mudrasService = {
  async getById(id) {
    return prisma.mudras.findUnique({ where: { id: Number(id) } });
  },
  async getByTherapyToolsId(therapyToolsId) {
    return prisma.mudras.findUnique({
      where: { therapyToolsId: Number(therapyToolsId) },
    });
  },
  async create(body) {
    const therapyToolsId = requireTherapyToolsId(body);
    return prisma.mudras.create({
      data: {
        therapyToolsId,
        mudraNames: body.mudraNames ?? null,
        repeatingTimingsPerDay:
          body.repeatingTimingsPerDay != null
            ? Number(body.repeatingTimingsPerDay)
            : null,
      },
    });
  },
  async update(id, body) {
    const data = {};
    if (body.mudraNames !== undefined) data.mudraNames = body.mudraNames;
    if (body.repeatingTimingsPerDay !== undefined) {
      data.repeatingTimingsPerDay =
        body.repeatingTimingsPerDay == null
          ? null
          : Number(body.repeatingTimingsPerDay);
    }
    return prisma.mudras.update({ where: { id: Number(id) }, data });
  },
  async remove(id) {
    return prisma.mudras.delete({ where: { id: Number(id) } });
  },
};

export const breathingService = {
  async getById(id) {
    return prisma.breathingExercises.findUnique({ where: { id: Number(id) } });
  },
  async getByTherapyToolsId(therapyToolsId) {
    return prisma.breathingExercises.findUnique({
      where: { therapyToolsId: Number(therapyToolsId) },
    });
  },
  async create(body) {
    const therapyToolsId = requireTherapyToolsId(body);
    return prisma.breathingExercises.create({
      data: {
        therapyToolsId,
        exercises: body.exercises ?? null,
        repeatingTimingsPerDay:
          body.repeatingTimingsPerDay != null
            ? Number(body.repeatingTimingsPerDay)
            : null,
      },
    });
  },
  async update(id, body) {
    const data = {};
    if (body.exercises !== undefined) data.exercises = body.exercises;
    if (body.repeatingTimingsPerDay !== undefined) {
      data.repeatingTimingsPerDay =
        body.repeatingTimingsPerDay == null
          ? null
          : Number(body.repeatingTimingsPerDay);
    }
    return prisma.breathingExercises.update({
      where: { id: Number(id) },
      data,
    });
  },
  async remove(id) {
    return prisma.breathingExercises.delete({ where: { id: Number(id) } });
  },
};
