import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as therapyController from "../controllers/therapy.controller.js";
import { therapyToolsByTherapyRouter } from "./therapyTools.routes.js";

/** Mounted at /patients/:patientId/diseases/:diseaseId/therapies */
export const therapiesByDiseaseRouter = Router({ mergeParams: true });

therapiesByDiseaseRouter.get(
  "/",
  asyncHandler(therapyController.listByDisease),
);
therapiesByDiseaseRouter.post("/", asyncHandler(therapyController.create));

therapiesByDiseaseRouter.use(
  "/:therapyId/therapy-tools",
  therapyToolsByTherapyRouter,
);

const therapiesRouter = Router();

therapiesRouter.get("/:id", asyncHandler(therapyController.getById));
therapiesRouter.patch("/:id", asyncHandler(therapyController.update));
therapiesRouter.delete("/:id", asyncHandler(therapyController.remove));

export default therapiesRouter;
