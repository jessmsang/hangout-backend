const router = require("express").Router();
const {
  createActivity,
  getActivities,
  deleteActivityById,
  addSave,
  removeSave,
  addComplete,
  removeComplete,
} = require("../controllers/activities");
const { auth } = require("../middlewares/auth");
const {
  validateCreateActivity,
  validateActivityIDFormat,
} = require("../middlewares/validation");

//public routes
router.get("/", getActivities);

//private routes
router.use(auth);

router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming body for /activities:", req.body);
    next();
  },
  validateCreateActivity,
  createActivity
);
router.delete("/:activityId", validateActivityIDFormat, deleteActivityById);

router.put("/:activityId/saved", validateActivityIDFormat, addSave);
router.delete("/:activityId/saved", validateActivityIDFormat, removeSave);

router.put("/:activityId/completed", validateActivityIDFormat, addComplete);
router.delete(
  "/:activityId/completed",
  validateActivityIDFormat,
  removeComplete
);

module.exports = router;
