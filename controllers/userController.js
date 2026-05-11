const User = require("../models/User");
const bcrypt = require("bcryptjs");


  //  GET ALL USERS (ADMIN)

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    
    res.status(200).json(users);

  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =========================================================
    UPDATE USER ROLE (ADMIN)
========================================================= */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "Role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =========================================================
    UPDATE PROFILE (USER)
========================================================= */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.photo = req.body.photo || user.photo;

    // optional password update
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error("updateUserProfile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ========================================================= */
module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  updateUserProfile,
  getMyProfile,
};