import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as medicalReportController from "../controllers/medicalReport.controller.js";

const router = Router();

router.get("/", asyncHandler(medicalReportController.list));
router.get("/:id", asyncHandler(medicalReportController.getById));
router.post("/", asyncHandler(medicalReportController.create));
router.patch("/:id", asyncHandler(medicalReportController.update));
router.delete("/:id", asyncHandler(medicalReportController.remove));

export default router;
