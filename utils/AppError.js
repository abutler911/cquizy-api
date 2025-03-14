export class AppError extends Error {
    constructor(message, statusCode, errorCode = null, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode || `ERR_${statusCode}`;
      this.details = details;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  
    static badRequest(message, errorCode = "ERR_BAD_REQUEST", details = null) {
      return new AppError(message, 400, errorCode, details);
    }
  
    static unauthorized(
      message = "Unauthorized",
      errorCode = "ERR_UNAUTHORIZED",
      details = null
    ) {
      return new AppError(message, 401, errorCode, details);
    }
  
    static forbidden(
      message = "Forbidden",
      errorCode = "ERR_FORBIDDEN",
      details = null
    ) {
      return new AppError(message, 403, errorCode, details);
    }
  
    static notFound(
      message = "Resource not found",
      errorCode = "ERR_NOT_FOUND",
      details = null
    ) {
      return new AppError(message, 404, errorCode, details);
    }
  
    static serverError(
      message = "Internal server error",
      errorCode = "ERR_SERVER",
      details = null
    ) {
      return new AppError(message, 500, errorCode, details);
    }
  }
  
  export default AppError;