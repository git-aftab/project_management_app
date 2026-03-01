import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

const validate = (req, res, next) => {
  console.log(req["express-validator#contexts"]);

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];

  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg })); //push the error as object with path and err

  throw new ApiError(422, "Recieved Data is not valid", extractedErrors);
};

export { validate };
