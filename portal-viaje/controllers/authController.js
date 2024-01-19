const express = require("express");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};

/**
 * @param {Object} user - The user object.
 * @param {number} statusCode - The status code.
 * @param {express.Response} res - The response object.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  process.env.NODE_ENV === "production"
    ? (cookieOptions.secure = true)
    : (cookieOptions.secure = false);

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

const signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new appError("Please provide email and password!", 400));
  }

  // 2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Incorrect email or password", 401));
  }

  // 3) if everything ok, send token to client
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new appError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user changed password after the token was issued
  const userFound = await User.findById(decoded.id);

  if (!userFound) {
    return next(
      new appError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (userFound.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = userFound;
  // GRANT ACCESS TO PROTECTED ROUTE
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "lead-guide"]. role="user"
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

// esta funcion es para cuando el usuario olvida su contraseña y la quiere resetear por medio de un email que se le envia con un token que expira en 10 minutos y que se le envia al email del usuario
const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new appError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2) if token has not expired, and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new appError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  // 3) update changedPasswordAt property for the user

  // 4) log the user in, send JWT
  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  let password, newPassword, newPasswordConfirm;
  ({ password, newPassword, newPasswordConfirm } = req.body);

  // 1) get user from collection
  const user = await User.findById(req.user.id).select("+password");

  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new appError("Incorrect email or password", 401));
  }
  // 2) check if posted current password is correct

  // 3) if so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save({ validateBeforeSave: false });

  // 4) log user in, send JWT
  createSendToken(user, 200, res);
});

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
