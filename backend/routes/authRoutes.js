const express = require("express");
const router = express.Router();

const userController = require("../controllers/authController");

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/me", userController.authMiddleware, userController.getMe);
router.post("/change-password", userController.authMiddleware, userController.changePassword);

router.post(
  "/enable",
  userController.authMiddleware,
  userController.authorizeAdmin,
  userController.enableUser
);

router.post(
  "/disable",
  userController.authMiddleware,
  userController.authorizeAdmin,
  userController.disableUser
);

module.exports = router;