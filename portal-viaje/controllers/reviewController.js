//const catchAsync = require("../utils/catchAsync");
//const appError = require("../utils/appError");
const Review = require("../models/reviewModel");
const handlerFactory = require("./handlerFactory");

// #region funciones que utilizo en las rutas
// const getAllReviews = catchAsync(async (req, res) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);

//   if (!reviews) {
//     new appError("No reviews found", 404);
//   }
//   res.status(200).json({
//     status: "success",
//     reviews: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
// #endregion

// #region Forma antigua de createReview
// const createReview = catchAsync(async (req, res) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });
// #endregion

const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

const getAllReviews = handlerFactory.getAll(Review);
const createReview = handlerFactory.createOne(Review);
const updateReview = handlerFactory.updateOne(Review);
const deleteReview = handlerFactory.deleteOne(Review);
const getOneReview = handlerFactory.getOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getOneReview,
};
