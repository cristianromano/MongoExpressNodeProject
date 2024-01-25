const express = require("express");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit"); // para limitar el numero de peticiones a la api
const helmet = require("helmet"); // para proteger la app de ciertos ataques
const mongoSanitize = require("express-mongo-sanitize"); // para proteger la app de ciertos ataques
const xss = require("xss-clean"); // para proteger la app de ciertos ataques
const hpp = require("hpp"); // para proteger la app de ciertos ataques

const appError = require("./utils/appError");
const TourRouter = require("./routes/tourRoutes");
const UserRouter = require("./routes/userRoutes");
const ReviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// para poder tener la data en el req en post desde un form html
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(helmet()); // para proteger la app de ciertos ataques como xss (eliminar html de los querys) y otros

const limiter = rateLimit({
  max: 30, // maximo numero de peticiones
  windowMs: 60 * 60 * 1000, // 1 hora
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter); // para limitar el numero de peticiones a la api

// para poder tener la data en el req en post
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(mongoSanitize()); // para proteger la app de ciertos ataques como query injection (eliminar $ y . de los querys)
app.use(xss()); // para proteger la app de ciertos ataques como xss (eliminar html de los querys) y otros (cross site scripting)
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
); // para proteger la app de ciertos ataques como parameter pollution (eliminar parametros duplicados)

//app.use(express.urlencoded({ extended: true }));

//middleware
// app.use((req, res, next) => {
//   console.log("Hello from the middleware 👋 ");
//   next();
// });

app.use("/", viewRouter);
app.use("/api/v1/tours", TourRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/reviews", ReviewRouter);

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
