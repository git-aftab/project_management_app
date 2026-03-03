import { Router } from "express";
import {
  getProjectNotes,
  getProjectNotesDetails,
  createProjectNotes,
  updateProjectNotes,
  delProjectNotes,
} from "../controllers/notes.controllers.js";

import { createNotesValidators } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(getProjectNotes)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createNotesValidators(),
    validate,
    createProjectNotes,
  );

router
  .route("/:projectId/n/:noteId")
  .get(validateProjectPermission(AvailableUserRole), getProjectNotesDetails)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    updateProjectNotes,
  )
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    delProjectNotes,
  );

export default router;
