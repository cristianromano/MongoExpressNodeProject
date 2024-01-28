const express = require("express");
const controller = require("../controllers/viewController");
const router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.isLogged);

router.get("/", controller.getAllOverview);

router.get("/tours/:slug", controller.getTour);

router.get("/login", controller.getLoginForm);

module.exports = router;
