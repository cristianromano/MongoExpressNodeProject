const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.route("/").get(controller.getAllUsers).post(controller.createUser);

router
  .route("/:id")
  .get(controller.getOneUser)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
