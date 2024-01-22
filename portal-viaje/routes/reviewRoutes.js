const express = require("express");
const authController = require("../controllers/authController");
const controllers = require("../controllers/reviewController");

// mergeParams: true -> para que pueda acceder a los params de tourRoutes.js (en este caso el tourId)
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, controllers.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    controllers.setTourUserIds,
    controllers.createReview
  );

router.route("/:id").delete(controllers.deleteReview);
router.route("/:id").patch(controllers.updateReview);
router.route("/:id").get(controllers.getOneReview);

module.exports = router;
