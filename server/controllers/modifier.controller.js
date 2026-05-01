import {
  yogaService,
  pranayamaService,
  mudrasService,
  breathingService,
} from "../services/modifier.service.js";

function notFound(res) {
  return res.status(404).json({ error: "Not found" });
}

export const yoga = {
  async getById(req, res) {
    const row = await yogaService.getById(req.params.id);
    if (!row) return notFound(res);
    res.json(row);
  },
  async getByTools(req, res) {
    const row = await yogaService.getByTherapyToolsId(req.params.therapyToolsId);
    if (!row) return notFound(res);
    res.json(row);
  },
  async create(req, res) {
    const row = await yogaService.create(req.body);
    res.status(201).json(row);
  },
  async update(req, res) {
    const row = await yogaService.update(req.params.id, req.body);
    res.json(row);
  },
  async remove(req, res) {
    await yogaService.remove(req.params.id);
    res.status(204).send();
  },
};

export const pranayama = {
  async getById(req, res) {
    const row = await pranayamaService.getById(req.params.id);
    if (!row) return notFound(res);
    res.json(row);
  },
  async getByTools(req, res) {
    const row = await pranayamaService.getByTherapyToolsId(
      req.params.therapyToolsId,
    );
    if (!row) return notFound(res);
    res.json(row);
  },
  async create(req, res) {
    const row = await pranayamaService.create(req.body);
    res.status(201).json(row);
  },
  async update(req, res) {
    const row = await pranayamaService.update(req.params.id, req.body);
    res.json(row);
  },
  async remove(req, res) {
    await pranayamaService.remove(req.params.id);
    res.status(204).send();
  },
};

export const mudras = {
  async getById(req, res) {
    const row = await mudrasService.getById(req.params.id);
    if (!row) return notFound(res);
    res.json(row);
  },
  async getByTools(req, res) {
    const row = await mudrasService.getByTherapyToolsId(
      req.params.therapyToolsId,
    );
    if (!row) return notFound(res);
    res.json(row);
  },
  async create(req, res) {
    const row = await mudrasService.create(req.body);
    res.status(201).json(row);
  },
  async update(req, res) {
    const row = await mudrasService.update(req.params.id, req.body);
    res.json(row);
  },
  async remove(req, res) {
    await mudrasService.remove(req.params.id);
    res.status(204).send();
  },
};

export const breathing = {
  async getById(req, res) {
    const row = await breathingService.getById(req.params.id);
    if (!row) return notFound(res);
    res.json(row);
  },
  async getByTools(req, res) {
    const row = await breathingService.getByTherapyToolsId(
      req.params.therapyToolsId,
    );
    if (!row) return notFound(res);
    res.json(row);
  },
  async create(req, res) {
    const row = await breathingService.create(req.body);
    res.status(201).json(row);
  },
  async update(req, res) {
    const row = await breathingService.update(req.params.id, req.body);
    res.json(row);
  },
  async remove(req, res) {
    await breathingService.remove(req.params.id);
    res.status(204).send();
  },
};
