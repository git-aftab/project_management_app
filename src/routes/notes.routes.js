import { Router } from "express";
import {
  getProjectNotesById,
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
  .get(validateProjectPermission(), getProjectNotesById)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createNotesValidators(),
    validate,
    createProjectNotes,
  );

router
  .route("/:projectId/n/:noteId")
  .get(AvailableUserRole(), getProjectNotesDetails)
  .post(
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
