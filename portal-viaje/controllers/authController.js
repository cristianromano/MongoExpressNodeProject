const User = require("../models/userModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
  });
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

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
};
