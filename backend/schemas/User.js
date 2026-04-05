const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    fullName: {
      type: String,
      default: ""
    },

    avatarUrl: {
      type: String,
      default: "https://i.sstatic.net/l60Hf.png"
    },

    status: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      ref: "Role"
    },

    loginCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", user);