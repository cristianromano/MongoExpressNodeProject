const express = require("express");
const controller = require("../controllers/viewController");
const router = express.Router();

router.get("/", controller.getAllOverview);

router.get("/tours/:slug", controller.getTour);

module.exports = router;
