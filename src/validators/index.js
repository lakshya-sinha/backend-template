import { body } from "express-validator";

const userRegisterValidator = () => {
  return [

    //? Validation for e-mail 
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    //? Validation for user-name 
    body("username")
      .trim()
      .isEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be aleast 3 characters long"),

    //? Validation for pass-word 
    body("password")
      .trim()
      .isEmpty()
      .withMessage("Password is required"),

    //? Validation for full-name 
    body("fullName")
      .optional()
      .trim()
      .isEmpty()
      .withMessage("Name is required")


  ]
}

const userLoginValidator = () => {
  return [
    body("email")
      .optional()
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Email is invalid"),

    body("password")
      .notEmpty()
      .withMessage("password is required")
  ]
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword")
      .notEmpty()
      .withMessage("Old Password required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New Password required"),
  ]
}

const userForgotPasswordValidator = () => {
  return [
    body["email"]
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid")

  ]
}

const userResetForgotPasswordValidator = () => {
  return [
    body["newPassword"]
      .isEmpty()
      .withMessage("new Password required")
  ]
}

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator
}