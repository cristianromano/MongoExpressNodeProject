const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

const getAllOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

const getTour = async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
};

module.exports = {
  getAllOverview,
  getTour,
};
