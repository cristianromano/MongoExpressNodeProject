const express = require("express");
const authController = require("../controllers/authController");
const controllers = require("../controllers/reviewController");

// mergeParams: true -> para que pueda acceder a los params de tourRoutes.js (en este caso el tourId)
const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route("/")
  .get(controllers.getAllReviews)
  .post(
    authController.restrictTo("user"),
    controllers.setTourUserIds,
    controllers.createReview
  );

router
  .route("/:id")
  .delete(authController.restrictTo("admin", "user"), controllers.deleteReview);
router
  .route("/:id")
  .patch(authController.restrictTo("admin", "user"), controllers.updateReview);
router.route("/:id").get(controllers.getOneReview);

module.exports = router;
