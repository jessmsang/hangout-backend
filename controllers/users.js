const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
// const Activity = require("../models/activity");
const { BadRequestError } = require("../utils/BadRequestError");
const { NotFoundError } = require("../utils/NotFoundError");
const { InternalServerError } = require("../utils/InternalServerError");
const { ConflictError } = require("../utils/ConflictError");
const { UnauthorizedError } = require("../utils/UnauthorizedError");
const { CREATED } = require("../utils/errors");
const { JWT_SECRET } = process.env;
const { privateUserHelper } = require("../utils/userHelpers");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .populate("savedActivities")
    .populate("completedActivities")
    .orFail()
    .then((user) => {
      res.send(privateUserHelper(user));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Bad request"));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  User.create({ name, email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(CREATED).send({
        token,
        ...privateUserHelper(user),
      });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return next(new BadRequestError(Object.values(err.errors)[0].message));
      }
      if (err.code === 11000) {
        return next(
          new ConflictError(
            "This email is already registered. Please use a different email."
          )
        );
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token, ...privateUserHelper(user) });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "UnauthorizedError") {
        return next(new UnauthorizedError("Invalid email or password."));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const patchCurrentUser = (req, res, next) => {
  const { name, email } = req.body;
  const { _id } = req.user;

  User.findByIdAndUpdate(
    _id,
    { name, email },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      res.send(privateUserHelper(user));
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError(Object.values(err.errors)[0].message));
      }

      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const patchPassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  return User.findById(userId)
    .select("+password")
    .orFail()
    .then((user) =>
      bcrypt.compare(oldPassword, user.password).then((isMatch) => {
        if (!isMatch) {
          const err = new Error("Incorrect current password");
          err.name = "BadRequestError";
          throw err;
        }
        // assign new password **as plain text**, let pre-save hook hash it
        user.password = newPassword;
        return user.save();
      })
    )
    .then(() =>
      res.status(200).json({ message: "Password updated successfully" })
    )
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError")
        return next(new BadRequestError(Object.values(err.errors)[0].message));
      if (err.name === "BadRequestError")
        return next(new BadRequestError(err.message));
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const forgotPassword = (req, res, next) => {
  const { email } = req.body;
  console.log("Received forgot password request for:", email);

  const FRONTEND_URL =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL_LOCAL;

  User.findOne({ email })
    .then((user) => {
      console.log("User lookup result:", user ? "FOUND" : "NOT FOUND");
      if (!user) {
        return res.send({
          message:
            "If an account with that email exists, a reset link has been sent.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      console.log("Generated reset token:", resetToken);

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

      return user.save().then(() => {
        const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
        console.log("Reset link being sent:", resetLink);

        return sendEmail(
          user.email,
          "Reset your password",
          `<p>You requested a password reset.</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>Or copy and paste the following link into your browser:</p>
          <p>${resetLink}</p>
          <p>This link expires in 15 minutes.</p>`
        ).then(() =>
          res.send({
            message:
              "If an account with that email exists, a reset link has been sent.",
          })
        );
      });
    })
    .catch((err) =>
      next(new InternalServerError("An error has occurred on the server."))
    );
};

const resetPassword = (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .orFail()
    .then((user) => {
      user.password = password; //pre-save hook hashes it
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      return user.save();
    })
    .then(() =>
      res.send({
        message: "Password reset successfully! Redirecting you to login...",
      })
    )
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new BadRequestError("Invalid or expired reset token"));
      }

      if (err.name === "ValidationError") {
        return next(new BadRequestError(Object.values(err.errors)[0].message));
      }

      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

module.exports = {
  getCurrentUser,
  createUser,
  login,
  patchCurrentUser,
  patchPassword,
  forgotPassword,
  resetPassword,
};
