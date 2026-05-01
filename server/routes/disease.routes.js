import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as diseaseController from "../controllers/disease.controller.js";
import { medicalHistoryByDiseaseRouter } from "./medicalHistory.routes.js";
import { therapiesByDiseaseRouter } from "./therapy.routes.js";

export const diseasesByPatientRouter = Router({ mergeParams: true });

diseasesByPatientRouter.get(
  "/",
  asyncHandler(diseaseController.listByPatient),
);
diseasesByPatientRouter.post("/", asyncHandler(diseaseController.create));

diseasesByPatientRouter.use(
  "/:diseaseId/medical-history",
  medicalHistoryByDiseaseRouter,
);
diseasesByPatientRouter.use(
  "/:diseaseId/therapies",
  therapiesByDiseaseRouter,
);

const diseasesRouter = Router();

diseasesRouter.get("/:id", asyncHandler(diseaseController.getById));
diseasesRouter.post("/", asyncHandler(diseaseController.create));
diseasesRouter.patch("/:id", asyncHandler(diseaseController.update));
diseasesRouter.delete("/:id", asyncHandler(diseaseController.remove));

export default diseasesRouter;
