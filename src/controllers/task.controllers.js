import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { Task, Tasks } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Tasks.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(201)
    .json(new ApiResponse(201, tasks, "Task fetched Successfully"));
});
const createTasks = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { ProjectId } = req.params;
  const project = await Project.findById(ProjectId);

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }
  // we will also be getting a file, I can also be an array of file
  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Tasks.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(ProjectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assingedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task Created Successfully"));
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
  UpdateTasks,
};
