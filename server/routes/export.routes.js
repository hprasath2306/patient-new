import { Router } from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const archiver = require("archiver");
const unzipper = require("unzipper");
const multer = require("multer");
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../prisma/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

const upload = multer({ dest: path.join(__dirname, "..", "tmp") });
const router = Router();

// ── Excel Export: Patient list ──
router.get(
  "/patients/excel",
  asyncHandler(async (_req, res) => {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        diseases: {
          select: { nameOfDisease: true, severity: true, typeOfDisease: true },
        },
      },
    });

    const rows = patients.map((p) => ({
      "Patient ID": p.id,
      Name: p.name,
      Age: p.age,
      Gender: p.gender,
      "Place of Residence": p.placeOfResidence || "",
      "Reference Person": p.referencePerson || "",
      "Nature of Work": p.natureOfWork || "",
      "Height (cm)": p.height || "",
      "Weight (kg)": p.weight || "",
      BMI: p.bmi || "",
      "Sleep Patterns": p.sleepPatterns || "",
      Diet: p.diet || "",
      "Active Diseases": p.diseases.length,
      Diseases: p.diseases.map((d) => d.nameOfDisease || "Unnamed").join(", "),
      "Registered On": new Date(p.createdAt).toLocaleDateString(),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String(r[key]).length)
      ) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const date = new Date().toISOString().split("T")[0];
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="patients-${date}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  })
);

// ── Data Migration: Export everything as ZIP ──
router.get(
  "/migration/export",
  asyncHandler(async (_req, res) => {
    const [
      patients,
      diseases,
      medicalHistories,
      medicalReports,
      therapies,
      therapyTools,
      yoga,
      pranayama,
      mudras,
      breathing,
    ] = await Promise.all([
      prisma.patient.findMany(),
      prisma.disease.findMany(),
      prisma.medicalHistory.findMany(),
      prisma.medicalReport.findMany(),
      prisma.therapy.findMany(),
      prisma.therapyTools.findMany(),
      prisma.yoga.findMany(),
      prisma.pranayama.findMany(),
      prisma.mudras.findMany(),
      prisma.breathingExercises.findMany(),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      patients,
      diseases,
      medicalHistories,
      medicalReports,
      therapies,
      therapyTools,
      yoga,
      pranayama,
      mudras,
      breathing,
    };

    const date = new Date().toISOString().split("T")[0];
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="holisticcare-backup-${date}.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    archive.append(JSON.stringify(data, null, 2), { name: "data.json" });

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir).filter((f) => f !== ".gitkeep");
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          archive.file(filePath, { name: `uploads/${file}` });
        }
      }
    }

    await archive.finalize();
  })
);

// ── Data Migration: Import from ZIP ──
router.post(
  "/migration/import",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const tmpPath = req.file.path;

    try {
      const directory = await unzipper.Open.file(tmpPath);

      const dataEntry = directory.files.find((f) => f.path === "data.json");
      if (!dataEntry) {
        return res.status(400).json({ error: "Invalid backup: data.json not found" });
      }

      const raw = await dataEntry.buffer();
      const data = JSON.parse(raw.toString("utf-8"));

      if (!data.patients || !data.version) {
        return res.status(400).json({ error: "Invalid backup format" });
      }

      // Restore uploaded files
      const uploadFiles = directory.files.filter(
        (f) => f.path.startsWith("uploads/") && f.type === "File"
      );
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      for (const entry of uploadFiles) {
        const fileName = path.basename(entry.path);
        const dest = path.join(uploadsDir, fileName);
        const buf = await entry.buffer();
        fs.writeFileSync(dest, buf);
      }

      // Clear existing data (order matters for FK constraints)
      await prisma.breathingExercises.deleteMany();
      await prisma.mudras.deleteMany();
      await prisma.pranayama.deleteMany();
      await prisma.yoga.deleteMany();
      await prisma.therapyTools.deleteMany();
      await prisma.therapy.deleteMany();
      await prisma.medicalReport.deleteMany();
      await prisma.medicalHistory.deleteMany();
      await prisma.disease.deleteMany();
      await prisma.patient.deleteMany();

      // Restore data in order
      const stats = { patients: 0, diseases: 0, therapies: 0, reports: 0 };

      for (const p of data.patients || []) {
        await prisma.patient.create({ data: sanitize(p) });
        stats.patients++;
      }
      for (const d of data.diseases || []) {
        await prisma.disease.create({ data: sanitize(d) });
        stats.diseases++;
      }
      for (const mh of data.medicalHistories || []) {
        await prisma.medicalHistory.create({ data: sanitize(mh) });
      }
      for (const mr of data.medicalReports || []) {
        await prisma.medicalReport.create({ data: sanitize(mr) });
        stats.reports++;
      }
      for (const t of data.therapies || []) {
        await prisma.therapy.create({ data: sanitize(t) });
        stats.therapies++;
      }
      for (const tt of data.therapyTools || []) {
        await prisma.therapyTools.create({ data: sanitize(tt) });
      }
      for (const y of data.yoga || []) {
        await prisma.yoga.create({ data: sanitize(y) });
      }
      for (const pr of data.pranayama || []) {
        await prisma.pranayama.create({ data: sanitize(pr) });
      }
      for (const m of data.mudras || []) {
        await prisma.mudras.create({ data: sanitize(m) });
      }
      for (const b of data.breathing || []) {
        await prisma.breathingExercises.create({ data: sanitize(b) });
      }

      res.json({
        message: "Data imported successfully",
        stats,
        uploadedFiles: uploadFiles.length,
      });
    } finally {
      fs.unlinkSync(tmpPath);
    }
  })
);

// ── Migration info/stats ──
router.get(
  "/migration/stats",
  asyncHandler(async (_req, res) => {
    const [patients, diseases, therapies, reports] = await Promise.all([
      prisma.patient.count(),
      prisma.disease.count(),
      prisma.therapy.count(),
      prisma.medicalReport.count(),
    ]);

    let uploadCount = 0;
    let uploadSize = 0;
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir).filter((f) => f !== ".gitkeep");
      uploadCount = files.length;
      uploadSize = files.reduce((sum, f) => {
        try { return sum + fs.statSync(path.join(uploadsDir, f)).size; }
        catch { return sum; }
      }, 0);
    }

    res.json({ patients, diseases, therapies, reports, uploadCount, uploadSize });
  })
);

function sanitize(record) {
  const clean = { ...record };
  // Prisma expects date strings as Date objects
  if (clean.createdAt) clean.createdAt = new Date(clean.createdAt);
  if (clean.updatedAt) clean.updatedAt = new Date(clean.updatedAt);
  if (clean.date) clean.date = new Date(clean.date);
  return clean;
}

export default router;
