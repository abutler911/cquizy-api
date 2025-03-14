import { body, validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const validationErrors = errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      }));

      throw AppError.badRequest(
        "Validation failed",
        "ERR_VALIDATION",
        validationErrors
      );
    } catch (error) {
      next(error);
    }
  };
};

// Common validation rules
export const commonValidations = {
  // Example: validate ID parameter
  idParam: param("id")
    .isMongoId()
    .withMessage("Invalid ID format"),

  // Example: validate a required string field
  requiredString: (field) => 
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`),

  // Example: validate email
  email: body("email")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
};