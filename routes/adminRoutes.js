const express = require("express");
const router = express.Router();

const Video = require("../models/Video");
const User = require("../models/User");

// ================= DASHBOARD STATS =================
router.get("/stats", async (req, res) => {
  try {
    const videos = await Video.find();
    const users = await User.find();

    let totalLikes = 0;
    let totalDislikes = 0;
    let totalComments = 0;
    let totalViews = 0;

    videos.forEach((v) => {
      totalLikes += v.likes.length;
      totalDislikes += v.dislikes.length;
      totalComments += v.comments.length;
      totalViews += v.views;
    });

    res.json({
      totalVideos: videos.length,
      totalUsers: users.length,
      totalLikes,
      totalDislikes,
      totalComments,
      totalViews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ALL VIDEOS =================
router.get("/videos", async (req, res) => {
  const videos = await Video.find().populate("owner");
  res.json(videos);
});

// ================= ALL USERS =================
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;