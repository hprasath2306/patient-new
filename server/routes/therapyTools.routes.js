import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as therapyToolsController from "../controllers/therapyTools.controller.js";
/** Mounted at .../therapies/:therapyId/therapy-tools */
export const therapyToolsByTherapyRouter = Router({ mergeParams: true });

therapyToolsByTherapyRouter.get(
  "/",
  asyncHandler(therapyToolsController.getByTherapy),
);
therapyToolsByTherapyRouter.post(
  "/",
  asyncHandler(therapyToolsController.create),
);

const therapyToolsRouter = Router();

therapyToolsRouter.get("/:id", asyncHandler(therapyToolsController.getById));
therapyToolsRouter.patch(
  "/:id",
  asyncHandler(therapyToolsController.update),
);
therapyToolsRouter.delete(
  "/:id",
  asyncHandler(therapyToolsController.remove),
);

export default therapyToolsRouter;
