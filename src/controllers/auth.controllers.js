import { User } from "../models/user.model";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/asyncHandler";
import {sendEmail} from '../utils/mail.js'

// Generate Access Token and Refresh Token

const generateAccessAndRefreshTokens = asyncHandler(async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      500,
      "Something went Wrong while generating the access token.",
    );
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken; // adding ref token to DB
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  const user = User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  // After the user is created, Generate the temp_ token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();
});
