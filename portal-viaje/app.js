const express = require("express");
const morgan = require("morgan");
const appError = require("./utils/appError");
const TourRouter = require("./routes/tourRoutes");
const UserRouter = require("./routes/userRoutes");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// para poder tener la data en el req en post
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware
// app.use((req, res, next) => {
//   console.log("Hello from the middleware 👋 ");
//   next();
// });

app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", TourRouter);
app.use("/api/v1/users", UserRouter);

// si no encuentra la ruta en el router de tours o users entonces pasa por aqui y muestra el error 404
app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware para todos los errores que se pasen a next() en cualquier parte de la app y que no sean errores de express (errores de express se manejan por defecto)
app.use(globalErrorHandler);

module.exports = app;
