const router = require("express").Router();
const User = require("../models/user");
const { NotFoundError } = require("../utils/NotFoundError");

const {
  getCurrentUser,
  patchCurrentUser,
  patchPassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/users");

const { auth } = require("../middlewares/auth");

const {
  validateEditUser,
  validatePasswordUpdate,
} = require("../middlewares/validation");

// PUBLIC ROUTES (no auth)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// AUTHENTICATED ROUTES
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateEditUser, patchCurrentUser);
router.patch("/me/password", auth, validatePasswordUpdate, patchPassword);

router.delete("/me", auth, (req, res, next) => {
  const userId = req.user._id;

  User.findByIdAndDelete(userId)
    .then((user) => {
      if (!user) return next(new NotFoundError("User not found"));
      res.send({ message: "Account deleted successfully" });
    })
    .catch(next);
});

module.exports = router;
