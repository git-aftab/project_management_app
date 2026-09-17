import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
  updateAvatar,
  generateUploadURL,
  getAvatarUrl,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Unsecure / Optional JWT Routes
router
  .route("/register")
  .post(
    [...userRegisterValidator(), validate],
    registerUser,
  );

router.route("/login").post([...userLoginValidator(), validate], loginUser);

// Presign upload URL (works for both unauthenticated registration and logged-in avatar updates)
router.route("/presign").post(optionalVerifyJWT, generateUploadURL);

// here /verify-email/:verificationToken --> the "verificationToken" is the one we get form the "req.param"s in controller.
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post([...userForgotPasswordValidator(), validate], forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post([...userResetForgotPasswordValidator(), validate], resetForgotPassword);

// Secure routes --> These require JWT
router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/current-user")
  .get(verifyJWT, getCurrentUser)
  .post(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    [...userChangeCurrentPasswordValidator(), validate],
    changeCurrentPassword,
  );

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

// Update avatar (secured)
router.route("/update-avatar").patch(verifyJWT, updateAvatar);

router.route("/avatar").get(verifyJWT, getAvatarUrl);

export default router;
