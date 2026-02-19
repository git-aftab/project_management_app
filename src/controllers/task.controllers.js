import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { Tasks } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";

const getTasksById = asyncHandler(async (req, res) => {
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
  const { taskId } = req.params;
  const { assignedTo, status, title, description } = req.body;

  const project = await Tasks.findByIdAndUpdate(taskId, {
    title,
    description,
    assignedTo,
    status,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Task Updated Successfully"));
});
const getTasks = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Tasks.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [{ _id: 1, username: 1, fullName: 1, avatar: 1 }],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(201).json(201, task[0], "Task fetched successfully");
});
const deleteTasks = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const delTask = await Tasks.findByIdAndDelete(taskId);

  if (!delTask) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, delTask, "Task deleted successfully"));
});
const createSubTasks = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  const Task = await Tasks.findById(taskId);

  if (!Task) {
    throw new ApiError(404, "Task not found");
  }

  const newSubTask = await subTask.create({
    title,
    task: taskId,
    createdBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newSubTask, "Sub-Task Created Successuflly"));
});
const updateSubTasks = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title } = req.body;

  const updatedSubTask = await subTask.findByIdAndUpdate(
    subTaskId,
    { title },
    { new: true },
  );

  if (!updatedSubTask) {
    throw new ApiError(404, "Sub-Task not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateSubTasks, "Sub-Task updated Successfully"),
    );
});
const deleteSubTasks = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const delSubTask = await subTask.findByIdAndDelete(subTaskId);

  if (!delSubTask) {
    throw new ApiError(404, "Sub-Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, delSubTask, "Sub-Task deleted successfully"));
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
