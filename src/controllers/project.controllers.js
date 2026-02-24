import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: { $size: "$projectmembers" },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched Successfully."));
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
  const { projectId } = req.params;

  // Check project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Aggregate members
  const projectMembers = await ProjectMember.aggregate([
    {
      // Step 1: only members of this project
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      // Step 2: join user details
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      // Step 3: user[] → user {}
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
    {
      // Step 4: shape final response
      $project: {
        _id: 0,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        user: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project members fetched successfully",
      ),
    );
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, username, role } = req.body;
  const { projectId } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      user: user._id,
      project: projectId,
    },
    {
      role: role,
    },
    {
      new: true,
      upsert: true, //this is where the user is added
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectMember, "Project member added successfully"),
    );
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member deleted successfully",
      ),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(404, "Invalid Role");
  }

  let projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    { role: newRole },
    { new: true },
  );

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member role updated successfully",
      ),
    );
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
