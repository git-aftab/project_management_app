import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificatonToken -emailVerificationExpiry", // dont wanna send these data
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user; // injecting the user to the req if available.
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token", error);
  }
});

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(404, "Project id is missing");
    }

    // assuming this runs only after verifyJWT
    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // not getting role from frontend insetead access form DB because user can give any other role.
    const givenRole = project?.role;
    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(403, "You Dont have access to perform this action");
    }

    // if correct
    next();
  });
};
