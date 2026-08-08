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
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
// import { deleteModel } from "mongoose";

const router = Router();

// whatever I write after this line will have verifyJWT
router.use(verifyJWT);

router
  .route("/")
  .get(
    cacheMiddleware((req) => `projects:${req.user.id}`),
    getProjects,
  )
  .post([...createProjectValidator(), validate], createProject);

router
  .route("/:projectId")
  .get(
    cacheMiddleware((req) => `projectId:${req.params.projectId}`),
    validateProjectPermission(AvailableUserRole),
    getProjectById,
  )
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

router
  .route("/:projectId/members")
  .get(cacheMiddleware((req) => `projectMembers:${req.params.projectId}/members`), getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemberToProjectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  // .get(cacheMiddleware((req) => `projectMember:${req.params.projectId}/${req.params.userId}`), getProjectMembers)
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteProjectMember,
  );

export default router;
