const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/logout", authController.logout);
// Protect all routes after this middleware

router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
router.patch("/updateMe", controller.updateMe);
router.delete("/deleteMe", controller.deleteMe);
router.get("/me", controller.getMe, controller.getOneUser);

// Restrict all routes after this middleware to admin only
router.use(authController.restrictTo("admin"));

router.route("/").get(controller.getAllUsers).post(controller.createUser);

router
  .route("/:id")
  .get(controller.getOneUser)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
