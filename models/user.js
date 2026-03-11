const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { UnauthorizedError } = require("../utils/UnauthorizedError");

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
      validate: {
        validator(value) {
          return /^(?=.*[A-Z])(?=.*[!@#$%^&*_+\-=?]).{8,50}$/.test(value);
        },
        message:
          "Password must be 8-50 characters, include at least one uppercase letter and one special character.",
      },
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
    },

    savedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],

    completedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((err) => next(err));
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError("Invalid email or password");
        }

        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);
