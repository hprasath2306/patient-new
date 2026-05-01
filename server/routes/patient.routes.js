import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as patientController from "../controllers/patient.controller.js";
import { diseasesByPatientRouter } from "./disease.routes.js";

const router = Router();

router.get("/", asyncHandler(patientController.list));
router.post("/", asyncHandler(patientController.create));
router.use("/:patientId/diseases", diseasesByPatientRouter);
router.get("/:id", asyncHandler(patientController.getById));
router.patch("/:id", asyncHandler(patientController.update));
router.delete("/:id", asyncHandler(patientController.remove));

export default router;
