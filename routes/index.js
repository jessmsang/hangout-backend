const router = require("express").Router();
const { NotFoundError } = require("../utils/NotFoundError");

const userRouter = require("./users");
const activityRouter = require("./activities");

router.use("/users", userRouter);
router.use("/activities", activityRouter);
router.use((req, res, next) => {
  next(new NotFoundError("Endpoint not found"));
});

module.exports = router;
