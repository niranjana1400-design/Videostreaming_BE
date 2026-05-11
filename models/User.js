const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
  
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // 🛡 ROLE (USER / ADMIN)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    
    photo: {
      type: String,
      default: "https://ui-avatars.com/api/?name=User",
    },

    // (FOR ADMIN ANALYTICS)
    uploadedVideosCount: {
      type: Number,
      default: 0,
    },

    totalLikes: {
      type: Number,
      default: 0,
    },

    totalDislikes: {
      type: Number,
      default: 0,
    },

    totalComments: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", userSchema);