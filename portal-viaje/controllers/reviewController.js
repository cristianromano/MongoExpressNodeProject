const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  if (!reviews) {
    new appError("No reviews found", 404);
  }
  res.status(200).json({
    status: "success",
    reviews: reviews.length,
    data: {
      reviews,
    },
  });
});

const createReview = catchAsync(async (req, res) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

module.exports = {
  getAllReviews,
  createReview,
};
