const express = require("express");
const router = express.Router();

const {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getMyVideos,
  deleteVideo,
  updateVideo,
  addComment,
  deleteComment,
  toggleLike,
  toggleDislike,
} = require("../controllers/videoController");

const { protect } = require("../middleware/authMiddleware");


router.get("/", getAllVideos);
router.get("/my", protect, getMyVideos);

router.post("/", protect, uploadVideo);


router.post("/:id/comment", protect, addComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);


router.post("/:id/like", protect, toggleLike);
router.post("/:id/dislike", protect, toggleDislike);


router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);


router.get("/:id", getVideoById);

module.exports = router;