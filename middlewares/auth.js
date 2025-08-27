const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { UnauthorizedError } = require("../utils/UnauthorizedError");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Unauthorized access"));
  }
  const token = authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError("Unauthorized access"));
  }
  req.user = payload;
  return next();
};

module.exports = { auth };
