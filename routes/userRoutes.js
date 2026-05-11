const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  updateUserProfile,
  getMyProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");



router.get("/profile", protect, getMyProfile);


router.put("/profile", protect, updateUserProfile);

router.get("/", protect, checkRole("admin"), getUsers);


router.get("/:id", protect, checkRole("admin"), getUserById);

//  Delete user
router.delete("/:id", protect, checkRole("admin"), deleteUser);

//  Update user role (admin/user)
router.put("/:id/role", protect, checkRole("admin"), updateUserRole);


module.exports = router;