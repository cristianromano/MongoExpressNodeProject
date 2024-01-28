const appError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};

const handleduplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  console.log(Object.values(err.errors));
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new appError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      console.error("ERROR 💥", err);

      // 2) Send generic message
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      console.error("ERROR 💥", err);

      // 2) Send generic message
      res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later.",
      });
    }
  }
};
const errorGlobal = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
    } else if (err.code == 11000) {
      error = handleduplicateFieldsDB(error);
    } else if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } else if (err.name === "JsonWebTokenError") {
      error = new appError("Invalid token. Please log in again!", 401);
    } else if (err.name === "TokenExpiredError") {
      error = new appError("Your token has expired! Please log in again.", 401);
    }

    sendErrorProd(error, req, res);
  }

  next();
};

module.exports = errorGlobal;
