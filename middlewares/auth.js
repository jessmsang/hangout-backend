const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { UnauthorizedError } = require("../utils/UnauthorizedError");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  // Check header existence
  if (!authorization) {
    return next(new UnauthorizedError("Authorization header missing"));
  }

  // Check Bearer prefix
  if (!authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Unauthorized access"));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

module.exports = { auth };
