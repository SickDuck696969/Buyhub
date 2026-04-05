const express = require("express");
const router = express.Router();

const userController = require("../controllers/authController");
const middleware = require("../middleware/auth");

router.get(
  "/users",
  middleware.protect,
  middleware.admin,
  userController.getAllUsers
);

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/me", middleware.protect, userController.getMe);
router.post("/change-password", middleware.protect, userController.changePassword);

router.post(
  "/enable",
  middleware.protect,
  middleware.admin,
  userController.enableUser
);

router.post(
  "/disable",
  middleware.protect,
  middleware.admin,
  userController.disableUser
);

module.exports = router;