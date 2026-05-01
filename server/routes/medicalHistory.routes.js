import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as medicalHistoryController from "../controllers/medicalHistory.controller.js";

/** Mounted at /patients/:patientId/diseases/:diseaseId/medical-history */
export const medicalHistoryByDiseaseRouter = Router({ mergeParams: true });

medicalHistoryByDiseaseRouter.get(
  "/",
  asyncHandler(medicalHistoryController.getByDisease),
);
medicalHistoryByDiseaseRouter.post(
  "/",
  asyncHandler(medicalHistoryController.create),
);

const medicalHistoriesRouter = Router();

medicalHistoriesRouter.get(
  "/:id",
  asyncHandler(medicalHistoryController.getById),
);
medicalHistoriesRouter.patch(
  "/:id",
  asyncHandler(medicalHistoryController.update),
);
medicalHistoriesRouter.delete(
  "/:id",
  asyncHandler(medicalHistoryController.remove),
);

export default medicalHistoriesRouter;
