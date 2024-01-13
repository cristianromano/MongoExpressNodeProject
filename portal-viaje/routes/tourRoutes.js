const express = require("express");
const router = express.Router();
const controllers = require("../controllers/tourController");

//router.param("id", controllers.checkId);

router.route("/monthly-plan/:year").get(controllers.getMonthlyPlan);

router.route("/tour-stats").get(controllers.getTourStats);

router
  .route("/top-5-cheap")
  .get(controllers.aliasTopTours, controllers.getAllTours);

router.route("/").get(controllers.getAllTours).post(controllers.createTour);

router
  .route("/:id")
  .get(controllers.getOneTour)
  .patch(controllers.updateTour)
  .delete(controllers.deleteTour);

module.exports = router;
