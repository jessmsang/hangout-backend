const mongoose = require("mongoose");
const validator = require("validator");

const costLevels = ["$", "$$", "$$$"];

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Activity name is required."],
    minlength: [2, "Name must be at least 2 characters long."],
    maxlength: [50, "Name must be no more than 50 characters long."],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, "Description can be at most 500 characters long."],
    trim: true,
  },
  seasons: {
    type: [String],
    enum: ["summer", "fall", "spring", "winter"],
    default: [],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Please select at least one season.",
    },
  },
  location: {
    type: [String],
    enum: ["indoor", "outdoor"],
    default: [],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Please select at least one location.",
    },
  },
  category: {
    type: [String],
    enum: [
      "active",
      "adventure",
      "low-key",
      "creative",
      "dining",
      "festive",
      "romantic",
    ],
    default: [],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Please select at least one category.",
    },
  },
  groupSize: {
    min: {
      type: Number,
      min: [1, "Minimum group size must be at least 1."],
      max: [100, "Minimum group size cannot exceed 100."],
      required: true,
    },
    max: {
      type: Number,
      min: [1, "Maximum group size must be at least 1."],
      max: [100, "Maximum group size cannot exceed 100."],
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.groupSize.min;
        },
        message:
          "Maximum group size must be greater than or equal to minimum group size.",
      },
    },
  },
  cost: {
    min: {
      type: String,
      enum: costLevels,
      required: true,
    },
    max: {
      type: String,
      enum: costLevels,
      required: true,
      validate: {
        validator: function (value) {
          return costLevels.indexOf(value) >= costLevels.indexOf(this.cost.min);
        },
        message: "Max cost cannot be less than min cost.",
      },
    },
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Owner is required."],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
