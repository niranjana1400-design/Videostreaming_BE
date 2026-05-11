const Video = require("../models/Video");

/* ================= CREATE VIDEO ================= */
exports.uploadVideo = async (req, res) => {
  try {
    const { title, url, category, thumbnail } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL required" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const video = await Video.create({
      title,
      url,
      category: category || "Other",
      thumbnail: thumbnail || "https://picsum.photos/400/250",
      owner: req.user._id,
      likes: [],
      dislikes: [],
      comments: [],
    });

    const populated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.status(201).json(populated);
  } catch (err) {
    console.error("uploadVideo error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL VIDEOS ================= */
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({})
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    console.error("getAllVideos error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET VIDEO BY ID (🔥 FIXED CRASH) ================= */
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FIX: prevent crash like /videos/my or invalid id
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (err) {
    console.error("getVideoById error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET MY VIDEOS ================= */
exports.getMyVideos = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const videos = await Video.find({ owner: req.user._id })
      .populate("owner", "name email photo")
      .sort({ createdAt: -1 });

    return res.status(200).json(videos || []);
  } catch (err) {
    console.error("getMyVideos error:", err);
    return res.status(200).json([]);
  }
};

/* ================= UPDATE VIDEO ================= */
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    video.title = req.body.title || video.title;
    video.url = req.body.url || video.url;
    video.thumbnail = req.body.thumbnail || video.thumbnail;
    video.category = req.body.category || video.category;

    await video.save();

    const updated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.json(updated);
  } catch (err) {
    console.error("updateVideo error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE VIDEO ================= */
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isOwner =
      video.owner &&
      video.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await video.deleteOne();

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error("deleteVideo error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIKE ================= */
exports.toggleLike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = req.user?._id?.toString();

    if (!video || !userId) {
      return res.status(404).json({ message: "Video not found" });
    }

    const alreadyLiked = video.likes.includes(userId);

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
    }

    await video.save();

    const updated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.json(updated);
  } catch (err) {
    console.error("toggleLike error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DISLIKE ================= */
exports.toggleDislike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = req.user?._id?.toString();

    if (!video || !userId) {
      return res.status(404).json({ message: "Video not found" });
    }

    const alreadyDisliked = video.dislikes.includes(userId);

    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    }

    await video.save();

    const updated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.json(updated);
  } catch (err) {
    console.error("toggleDislike error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD COMMENT ================= */
exports.addComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    await video.save();

    const updated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.json(updated);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE COMMENT ================= */
exports.deleteComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comment = video.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner =
      comment.user &&
      comment.user.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await video.save();

    const updated = await Video.findById(video._id)
      .populate("owner", "name email photo")
      .populate("comments.user", "name email photo");

    res.json(updated);
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ message: err.message });
  }
};