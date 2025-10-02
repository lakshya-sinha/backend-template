import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  } catch (err) {
    throw new ApiError(500, "Something went wrong when accessing token ");
  }

}



const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body


  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser) {
    throw new ApiError(409, "User with email or username is already exists.")
  }
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  })


  const { unHashedToken,
    hashedToken,
    tokenExpiry
  } = user.generateTemporaryToken()

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail(
    {
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
      ),
    })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry "
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user ")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { user: createdUser },
        "User registered successfully and verification email has been be send on your email!")
    )
})


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email) {
    throw new ApiError(400, "email is required!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exists");
  }


  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);


  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry "
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In successfully")
    )


})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    {
      new: true
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )




})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current User fetched Successfully"
      )
    )
})

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing")
  }


  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;


  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          isEmailVerified: true
        },
        "Email is verfied"
      )
    )

})

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  if (user.isEmailVerified = true) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unHashedToken,
    hashedToken,
    tokenExpiry
  } = user.generateTemporaryToken()

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail(
    {
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
      ),
    });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "mail has been send to your email"
      )
    )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refersh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    user.refreshToken = newRefreshToken;
    await user.save();

    return re
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken }
        )
      )

  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token")
  }



})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendEmail({
    email: user?.email,
    subject: "Password reset requrest ",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  })

  return res
    .staus(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail"
      )
    )


})

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError(489, "Token is Invalid or expired");
  }

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiRespnose(
        200,
        {},
        "Password reset Successfully."
      )
    )

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPaessword } = req.body;
  const user = await User.findById(req.user?.id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(
      400,
      "Invalid old password"
    )
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "password changed successfully"
      )
    )

})

export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  resetForgotPassword,
};