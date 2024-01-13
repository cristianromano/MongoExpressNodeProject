const express = require("express");
const morgan = require("morgan");

const TourRouter = require("./routes/tourRoutes");
const UserRouter = require("./routes/userRoutes");
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// para poder tener la data en el req en post
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware
app.use((req, res, next) => {
  console.log("Hello from the middleware 👋 ");
  next();
});

app.use("/api/v1/tours", TourRouter);
app.use("/api/v1/users", UserRouter);

module.exports = app;
