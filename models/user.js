const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [30, "Name must be no more than 30 characters long."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return validator.isEmail(value);
        },
        message: "Please enter a valid email address.",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.findUserByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.name = "UnauthorizedError";
    error.statusCode = 401;
    throw error;
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    const error = new Error("Invalid email or password");
    error.name = "UnauthorizedError";
    error.statusCode = 401;
    throw error;
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
