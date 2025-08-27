require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { errors } = require("celebrate");

// const mainRouter = require("./routes/index");
// const { createUser, login } = require("./controllers/users");
// const errorHandler = require("./middlewares/errorHandler");
// const limiter = require("./middlewares/rateLimit");
// const {
//   validateCreateUser,
//   validateUserLogin,
// } = require("./middlewares/validation");
// const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect
  //TODO - INSERT MONGODB CONNECTION STRING
  ()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use(cors());

app.use(requestLogger);
app.use(helmet());
// app.use(limiter);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.post(
  "/signup"
  // validateCreateUser, createUser
);
app.post(
  "/signin"
  // validateUserLogin, login
);

// app.use("/", mainRouter);

// app.use(errorLogger);

app.use(errors());
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
