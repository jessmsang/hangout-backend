const { UNAUTHORIZED } = require("./errors");

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED;
  }
}

module.exports = { UnauthorizedError };
