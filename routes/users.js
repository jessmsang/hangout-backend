const router = require("express").Router();

const {
  getCurrentUser,
  patchCurrentUser,
  patchPassword,
} = require("../controllers/users");
const { auth } = require("../middlewares/auth");
const {
  validateEditUser,
  validatePasswordUpdate,
} = require("../middlewares/validation");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateEditUser, patchCurrentUser);
router.patch("/me/password", auth, validatePasswordUpdate, patchPassword);

module.exports = router;
