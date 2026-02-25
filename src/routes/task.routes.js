import { Router } from "express";
import {
  getTasks,
  getTasksById,
  updateSubTasks,
  UpdateTasks,
  deleteSubTasks,
  deleteTasks,
  createSubTasks,
  createTasks,
} from "../controllers/task.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";
import { createTasksValidator } from "../validators/index.js";

import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

// ONlY verified jwt user can access after this
router.use(verifyJWT);

router
  .route("/:projectId")
  .get(getTasksById)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createTasksValidator(),
    validate,
    createTasks,
  );

router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRole), getTasksById)
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), validate, UpdateTasks)
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    deleteTasks,
  );

router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    validateProjectPermission(UserRolesEnum.ADMIN),
    validate,
    createSubTasks,
  );

router
  .route("/:projectId/st/:subTaskId")
  .put(validateProjectPermission(UserRolesEnum.ADMIN), validate, updateSubTasks)
  .delete(
    validateProjectPermission(UserRolesEnum.ADMIN),
    validate,
    deleteSubTasks,
  );

export default router