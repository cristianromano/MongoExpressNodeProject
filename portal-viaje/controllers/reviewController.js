const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

const getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

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
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

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
