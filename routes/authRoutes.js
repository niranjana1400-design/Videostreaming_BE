const express = require("express");

const {
  signup,
  login
} = require("../controllers/authController");

const {
  protect
} = require("../middleware/authMiddleware");

const {
  checkRole
} = require("../middleware/roleMiddleware");

const router = express.Router();


router.post("/register", signup);  
// Login user
router.post("/login", login);

// Admin  route
router.get("/admin", protect, checkRole("admin"), (req, res) => {
  res.json({
    message: "Admin Dashboard Access Granted",
    user: req.user
  });
});

// Normal user route
router.get("/user", protect, (req, res) => {
  res.json({
    message: "User Dashboard Access Granted",
    user: req.user
  });
});

module.exports = router;