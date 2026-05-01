import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as mod from "../controllers/modifier.controller.js";

const yogaRouter = Router();
yogaRouter.get("/:id", asyncHandler(mod.yoga.getById));
yogaRouter.post("/", asyncHandler(mod.yoga.create));
yogaRouter.patch("/:id", asyncHandler(mod.yoga.update));
yogaRouter.delete("/:id", asyncHandler(mod.yoga.remove));

const pranayamaRouter = Router();
pranayamaRouter.get("/:id", asyncHandler(mod.pranayama.getById));
pranayamaRouter.post("/", asyncHandler(mod.pranayama.create));
pranayamaRouter.patch("/:id", asyncHandler(mod.pranayama.update));
pranayamaRouter.delete("/:id", asyncHandler(mod.pranayama.remove));

const mudrasRouter = Router();
mudrasRouter.get("/:id", asyncHandler(mod.mudras.getById));
mudrasRouter.post("/", asyncHandler(mod.mudras.create));
mudrasRouter.patch("/:id", asyncHandler(mod.mudras.update));
mudrasRouter.delete("/:id", asyncHandler(mod.mudras.remove));

const breathingRouter = Router();
breathingRouter.get("/:id", asyncHandler(mod.breathing.getById));
breathingRouter.post("/", asyncHandler(mod.breathing.create));
breathingRouter.patch("/:id", asyncHandler(mod.breathing.update));
breathingRouter.delete("/:id", asyncHandler(mod.breathing.remove));

export { yogaRouter, pranayamaRouter, mudrasRouter, breathingRouter };
