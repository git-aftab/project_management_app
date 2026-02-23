import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectNotes } from "../models/note.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjectNotesById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  //   const {noteContent} = req.body

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const notes = ProjectNotes.find({ project: projectId });

  if (!notes) {
    throw new ApiError(404, "Notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const createProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project Not found");
  }

  const note = await ProjectNotes.create({
    projectId: projectId,
    content,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, note, "Note Created Successfully"));
});

const getProjectNotesDetails = asyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;

  const projectNote = await ProjectNotes.findOne({
    _id: noteId,
    project: projectId,
  });

  if (!projectNote) {
    throw new ApiError(404, "Note not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, projectNote, "Note fetched Successfully"));
});

const updateProjectNotes = asyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;
  const { content } = req.body;

  const updateNote = await ProjectNotes.findOneAndUpdate(
    { _id: noteId, project: projectId },
    { content },
    { new: true },
  );

  if (!updateNote) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateNote, "Note updated successfully"));
});

const delProjectNotes = asyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;

  const delNote = ProjectNotes.findOneAndDelete({
    project: projectId,
    note: noteId,
  });

  if (!delNote) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, delNote, "Note deleted successfully"));
});

export {
  getProjectNotesById,
  createProjectNotes,
  getProjectNotesDetails,
  updateProjectNotes,
  delProjectNotes,
};
