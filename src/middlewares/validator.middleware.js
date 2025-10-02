import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
import e from "cors";


export const validate = (req, res, next) => {
  const erorrs = validationResult(req)
  if (erorrs.isEmpty()) {
    return next();
  }

  const extractedErrors = []
  erorrs.array().map((err) => {
    extractedErrors.push(
      { [err.path]: err.msg }
    )
  });

  throw new ApiError(422, "Recieved data is not valid", extractedErrors);

}
