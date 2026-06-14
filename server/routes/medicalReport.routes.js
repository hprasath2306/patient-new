import { Router } from "express";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as medicalReportController from "../controllers/medicalReport.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

router.get("/", asyncHandler(medicalReportController.list));
router.get("/:id", asyncHandler(medicalReportController.getById));
router.post("/", upload.single("file"), asyncHandler(medicalReportController.create));
router.patch("/:id", asyncHandler(medicalReportController.update));
router.delete("/:id", asyncHandler(medicalReportController.remove));

export default router;
