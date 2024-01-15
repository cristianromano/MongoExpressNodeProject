const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

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

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined",
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined",
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined",
  });
};

const getOneUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined",
  });
};

module.exports = {
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
  getOneUser,
};
