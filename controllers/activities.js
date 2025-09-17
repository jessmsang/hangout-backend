const Activity = require("../models/activity");
const User = require("../models/user");
const { BadRequestError } = require("../utils/BadRequestError");
const { NotFoundError } = require("../utils/NotFoundError");
const { InternalServerError } = require("../utils/InternalServerError");
const { ForbiddenError } = require("../utils/ForbiddenError");
const { CREATED } = require("../utils/errors");

const createActivity = (req, res, next) => {
  const {
    name,
    description,
    seasons,
    location,
    category,
    groupSize,
    cost,
    isSaved,
    isCompleted,
  } = req.body;

  const owner = req.user._id;

  Activity.create({
    owner: req.user._id,
    name,
    description,
    seasons,
    location,
    category,
    groupSize,
    cost,
    isSaved,
    isCompleted,
  })
    .then((activity) => {
      res.status(CREATED).send(activity);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(Object.values(err.errors)[0].message));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const getActivities = (req, res, next) => {
  Activity.find({})
    .then((activities) => {
      res.send(activities);
    })
    .catch((err) => {
      console.error(err);
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const deleteActivityById = (req, res, next) => {
  const { activityId } = req.params;

  Activity.findById(activityId)
    .orFail()
    .then((activity) => {
      if (activity.owner.toString() !== req.user._id) {
        return next(
          new ForbiddenError("You can only delete your own activities")
        );
      }
      return Activity.findByIdAndDelete(activityId).then((deletedActivity) =>
        res.send({ data: deletedActivity })
      );
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("the activity ID format isn't valid"));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const addSave = (req, res, next) => {
  const { activityId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedActivities: activityId } },
    { new: true }
  )
    .orFail()
    .then((user) => {
      if (!user) throw new Error("User not found");
      res.send({ savedActivities: user.savedActivities });
    })
    .catch((err) => {
      console.error("addSave error:", err);
      return next(new InternalServerError("Server error"));
    });
};

const removeSave = (req, res, next) => {
  const { activityId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedActivities: activityId } },
    { new: true }
  )
    .orFail()
    .then((user) => res.send({ savedActivities: user.savedActivities }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid activity ID"));
      }
      return next(new InternalServerError("Server error"));
    });
};

const addComplete = (req, res, next) => {
  const { activityId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { completedActivities: activityId } },
    { new: true }
  )
    .orFail()
    .then((user) => res.send({ completedActivities: user.completedActivities }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid activity ID"));
      }
      return next(new InternalServerError("Server error"));
    });
};

const removeComplete = (req, res, next) => {
  const { activityId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { completedActivities: activityId } },
    { new: true }
  )
    .orFail()
    .then((user) => res.send({ completedActivities: user.completedActivities }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid activity ID"));
      }
      return next(new InternalServerError("Server error"));
    });
};

module.exports = {
  createActivity,
  getActivities,
  deleteActivityById,
  addSave,
  removeSave,
  addComplete,
  removeComplete,
};
