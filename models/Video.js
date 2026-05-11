const mongoose = require("mongoose");

/* ================= COMMENT SCHEMA ================= */
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

/* ================= VIDEO SCHEMA ================= */
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: "https://picsum.photos/400/250",
    },

    category: {
      type: String,
      enum: ["Other", "Education", "Music", "Comedy", "Movie"],
      default: "Other",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [commentSchema],

    views: {
      type: Number,
      default: 0,
    },

    watchTime: {
      type: Number,
      default: 0,
    },

    impressions: {
      type: Number,
      default: 0,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);


videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ title: "text" });
videoSchema.index({ category: 1 });
videoSchema.index({ createdAt: -1 });

videoSchema.pre("save", function (next) {
  if (!this.owner) {
    return next(new Error("Owner is required for video"));
  }

  if (!mongoose.Types.ObjectId.isValid(this.owner)) {
    return next(new Error("Invalid owner ID"));
  }

  next();
});

module.exports = mongoose.model("Video", videoSchema);