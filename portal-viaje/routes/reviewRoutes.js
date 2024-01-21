const express = require("express");
const authController = require("../controllers/authController");
const controllers = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, controllers.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    controllers.createReview
  );

module.exports = router;
