import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";
import environment from "../config/environment.js";

export const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.originalUrl} on this server`));
};

export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    logger.error("CSRF attack detected", {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
    });
    return res.status(403).json({
      status: "error",
      error: {
        message: "Invalid or missing CSRF token",
        code: "ERR_CSRF",
      },
    });
  }
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || "ERR_SERVER";

  logger.error(`${statusCode} - ${err.message}`, {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    errorCode,
    details: err.details,
    stack: err.stack,
  });

  const errorResponse = {
    status: "error",
    error: {
      message:
        statusCode === 500 && environment.isProduction
          ? "Internal server error"
          : err.message,
      code: errorCode,
    },
  };

  if (err.details && (!environment.isProduction || statusCode < 500)) {
    errorResponse.error.details = err.details;
  }

  if (!environment.isProduction) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};