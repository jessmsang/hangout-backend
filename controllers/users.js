const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { BadRequestError } = require("../utils/BadRequestError");
const { NotFoundError } = require("../utils/NotFoundError");
const { InternalServerError } = require("../utils/InternalServerError");
const { ConflictError } = require("../utils/ConflictError");
const { UnauthorizedError } = require("../utils/UnauthorizedError");
const { CREATED } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");
const { privateUserHelper } = require("../utils/userHelpers");

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail()
    .then((user) => {
      res.send(privateUserHelper(user));
    })
    .catch((err) => {
      console.error(err);

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
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
    )
    .then((user) => {
      res.status(CREATED).send(privateUserHelper(user));
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

module.exports = {
  getCurrentUser,
  createUser,
  login,
  patchCurrentUser,
};
