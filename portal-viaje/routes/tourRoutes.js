const express = require("express");
const router = express.Router();
const controllers = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

// redirecting to reviewRouter if the route is /:tourId/reviews (mounting a router)
router.use("/:tourId/reviews", reviewRouter); //mounting a router

router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    controllers.getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(controllers.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(controllers.getDistances);

router.route("/tour-stats").get(controllers.getTourStats);

router
  .route("/top-5-cheap")
  .get(controllers.aliasTopTours, controllers.getAllTours);

router
  .route("/")
  .get(controllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controllers.createTour
  );

router
  .route("/:id")
  .get(controllers.getOneTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controllers.deleteTour
  );

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     ReviewController.createReview
//   );

module.exports = router;
