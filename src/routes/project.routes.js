import { Router } from "express";
import {
  getProjects,
  getProjectById,
  getProjectMembers,
  createProject,
  updateProject,
  updateMemberRole,
  deleteProject,
  deleteProjectMember,
  addMembersToProject,
} from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  addMemberToProjectValidator,
} from "../validators/index.js";

import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants";

const router = Router();

// whatever I write after this line will have verifyJWT
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post([...createProjectValidator(), validate, createProject]);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    updateProject,
  ) // we are expecting an array in middleware ->role
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    deleteProject,
  );

export default router;
