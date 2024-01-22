const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");

const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    users: users.length,
    data: {
      users,
    },
  });
});

// ...AllowedFields is an array of strings
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  let { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new appError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updateUser) {
    return next(new appError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined",
  });
};

const updateUser = handlerFactory.updateOne(User);
const deleteUser = handlerFactory.deleteOne(User);
const getOneUser = handlerFactory.getOne(User);

module.exports = {
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
  getOneUser,
  updateMe,
  deleteMe,
};
