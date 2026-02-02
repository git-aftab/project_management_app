import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { projectNotes } from "../models/note.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  //test
});

const getProjectById = asyncHandler(async (req, res) => {
  //test
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project Created Successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );

  if (!project) {
    throw new ApiError(404, "Project now found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated Successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const delProject = await Project.findByIdAndDelete(projectId);

  if (!delProject) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, delProject, "Project Deleted Successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  //test
});

const addMembersToProject = asyncHandler(async (req, res) => {
  //test
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  //test
});

const updateMemberRole = asyncHandler(async (req, res) => {
  //test
});

export {
  getProjects,
  getProjectById,
  getProjectMembers,
  createProject,
  updateProject,
  updateMemberRole,
  deleteProject,
  deleteProjectMember,
  addMembersToProject,
};
