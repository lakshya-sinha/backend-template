import { Router } from "express";
import { registerUser, login, logoutUser, verifyEmail, refreshAccessToken, forgotPasswordRequest, getCurrentUser, changeCurrentPassword, resendEmailVerification, resetForgotPassword } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

//& UnSecure Route
router.route("/register").post(registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator, validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator, validate, resetForgotPassword);


//& Secure Route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);


export default router;