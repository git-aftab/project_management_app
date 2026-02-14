import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { Task } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";

const getTasks = asyncHandler(async (req, res) => {
  // TASk
});
const createTasks = asyncHandler(async (req, res) => {
  // TASk
});
const UpdateTasks = asyncHandler(async (req, res) => {
  // TASk
});
const getTasksById = asyncHandler(async (req, res) => {
  // TASk
});
const deleteTasks = asyncHandler(async (req, res) => {
  // TASk
});
const createSubTasks = asyncHandler(async (req, res) => {
  // TASk
});
const updateSubTasks = asyncHandler(async (req, res) => {
  // TASk
});
const deleteSubTasks = asyncHandler(async (req, res) => {
  // TASk
});


export {
    createTasks,
    createSubTasks,
    getTasks,
    getTasksById,
    deleteSubTasks,
    deleteTasks,
    updateSubTasks,
    UpdateTasks
}