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
  .get(getTasks)
  .post([...createTasksValidator(), validate, createTasks]);

router
  .route("/:projectId/t/:taskId")
  .get(getTasksById)
  .post([...validateProjectPermission(), validate, UpdateTasks])
  .delete([])
