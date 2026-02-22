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

router.route("/projectId")
.get(getProjectNotesById)
.post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createNotesValidators(),
    validate,
    createProjectNotes
)
