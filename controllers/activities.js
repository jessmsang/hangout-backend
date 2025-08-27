const Activity = require("../models/Activity");
const { BadRequestError } = require("../utils/BadRequestError");
const { NotFoundError } = require("../utils/NotFoundError");
const { InternalServerError } = require("../utils/InternalServerError");
const { ForbiddenError } = require("../utils/ForbiddenError");
const { CREATED } = require("../utils/errors");

const createActivity = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  Activity.create({ name, weather, imageUrl, owner })
    .then((activity) => {
      res.status(CREATED).send({ data: activity });
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
    .then((activities) => res.send(activities))
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

const likeActivity = (req, res, next) => {
  Activity.findByIdAndUpdate(
    req.params.activityId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((activity) => res.send(activity))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("the activity ID format isn't valid"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

const dislikeActivity = (req, res, next) => {
  Activity.findByIdAndUpdate(
    req.params.activityId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((activity) => res.send(activity))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("the activity ID format isn't valid"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Activity not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server.")
      );
    });
};

module.exports = {
  createActivity,
  getActivities,
  deleteActivityById,
  likeActivity,
  dislikeActivity,
};
