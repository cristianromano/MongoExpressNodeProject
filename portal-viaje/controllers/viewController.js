const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    new AppError("There is no tour with that name.", 404);
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

module.exports = {
  getAllOverview,
  getTour,
  getLoginForm,
};
