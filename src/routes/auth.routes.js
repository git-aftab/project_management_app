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
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../validators/index.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Unsecure Routes --> These doesn't require JWT
router
  .route("/register")
  .post([...userRegisterValidator(), validate], registerUser);

router.route("/login").post([...userLoginValidator(), validate], loginUser);

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
router.route("/current-user").post(verifyJWT, getCurrentUser);
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

export default router;
