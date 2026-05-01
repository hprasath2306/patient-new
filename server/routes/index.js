import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import patientRoutes from "./patient.routes.js";
import diseasesRouter from "./disease.routes.js";
import medicalHistoriesRouter from "./medicalHistory.routes.js";
import medicalReportRoutes from "./medicalReport.routes.js";
import therapiesRouter from "./therapy.routes.js";
import therapyToolsRouter from "./therapyTools.routes.js";
import {
  yogaRouter,
  pranayamaRouter,
  mudrasRouter,
  breathingRouter,
} from "./modifier.routes.js";
import * as mod from "../controllers/modifier.controller.js";

const router = Router();

router.use("/patients", patientRoutes);
router.use("/diseases", diseasesRouter);
router.use("/medical-histories", medicalHistoriesRouter);
router.use("/medical-reports", medicalReportRoutes);
router.use("/therapies", therapiesRouter);
router.use("/therapy-tools", therapyToolsRouter);

router.get(
  "/yoga/by-therapy-tools/:therapyToolsId",
  asyncHandler(mod.yoga.getByTools),
);
router.use("/yoga", yogaRouter);

router.get(
  "/pranayama/by-therapy-tools/:therapyToolsId",
  asyncHandler(mod.pranayama.getByTools),
);
router.use("/pranayama", pranayamaRouter);

router.get(
  "/mudras/by-therapy-tools/:therapyToolsId",
  asyncHandler(mod.mudras.getByTools),
);
router.use("/mudras", mudrasRouter);

router.get(
  "/breathing-exercises/by-therapy-tools/:therapyToolsId",
  asyncHandler(mod.breathing.getByTools),
);
router.use("/breathing-exercises", breathingRouter);

export default router;
