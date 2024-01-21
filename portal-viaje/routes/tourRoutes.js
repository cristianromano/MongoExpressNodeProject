const express = require("express");
const router = express.Router();
const controllers = require("../controllers/tourController");
const authController = require("../controllers/authController");
const ReviewController = require("../controllers/reviewController");
//router.param("id", controllers.checkId);

router.route("/monthly-plan/:year").get(controllers.getMonthlyPlan);

router.route("/tour-stats").get(controllers.getTourStats);

router
  .route("/top-5-cheap")
  .get(controllers.aliasTopTours, controllers.getAllTours);

router
  .route("/")
  .get(authController.protect, controllers.getAllTours)
  .post(controllers.createTour);

router
  .route("/:id")
  .get(controllers.getOneTour)
  .patch(controllers.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controllers.deleteTour
  );

router
  .route("/:tourId/reviews")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    ReviewController.createReview
  );

module.exports = router;
