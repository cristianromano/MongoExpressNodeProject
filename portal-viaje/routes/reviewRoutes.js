const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const controllers = require("../controllers/reviewController");

router
  .route("/")
  .get(authController.protect, controllers.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    controllers.createReview
  );

module.exports = router;
