//const fs = require("fs");
//const appError = require("../utils/appError");
//const APIFeatures = require("../utils/apiFeatures");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");

//#region forma antigua de getAllTours
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// #endregion

//#region funciones que utilizo en las rutas
const aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};
// #endregion

// #region forma antigua de getAllTours
// const getAllTours = catchAsync(async (req, res) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;

//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
// #endregion

const getAllTours = handlerFactory.getAll(Tour);
const createTour = handlerFactory.createOne(Tour);
const deleteTour = handlerFactory.deleteOne(Tour);
const updateTour = handlerFactory.updateOne(Tour);
const getOneTour = handlerFactory.getOne(Tour, { path: "reviews" }); // con populate te trae los datos de la referencia que le pases en el modelo de tours (en este caso los guides)

// #region forma antigua de getOneTour
// const getOneTour = catchAsync(async (req, res, next) => {
//   // con populate te trae los datos de la referencia que le pases en el modelo de tours (en este caso los guides)
//   const tour = await Tour.findById(req.params.id).populate("reviews");

//   if (!tour) {
//     return next(new appError("No tour found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour: tour,
//     },
//   });
// });
//#endregion

//#region forma antigua de getAllTours
// const createTour = catchAsync(async (req, res) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
// });
//#endregion

//#region ya no es necesario la funcion catchAsync porque ya lo estamos usando en el handler de rutas
// try {
// } catch (error) {
//   res.status(400).json({
//     status: "fail",
//     message: error.message,
//   });
// }
// });
//#endregion

//#region  forma antigua de deleteTour

// const deleteTour = catchAsync(async (req, res, next) => {
//   const tourDelete = await Tour.findByIdAndDelete(req.params.id);

//   if (!tourDelete) {
//     return next(new appError("No tour found with that ID", 404));
//   }
//   res.status(204).json({
//     status: "success",
//     data: tourDelete,
//     message: "Tour deleted",
//   });
// });
//#endregion

//#region forma antigua de updateTour
// const updateTour = catchAsync(async (req, res, next) => {
//   const tourUpdated = await Tour.findOneAndUpdate(
//     { _id: req.params.id },
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!tourUpdated) {
//     return next(new appError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour: tourUpdated,
//     },
//   });
// });
//#endregion

//#region Obtener estadisticas de tours
//https://www.mongodb.com/docs/manual/reference/operator/aggregation/month/
const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // con el _id podes segmentarlo por el campo que quieras
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        numRating: { $sum: "$ratingsQuantity" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },

    // excluye los que tengan el id EASY
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    // descompone el array en un documento por cada elemento
    {
      $unwind: "$startDates",
    },
    // te filtra por el año que le pases
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    // agrupa por el mes y te dice cuantos tours hay en ese mes y te los agrega en un array
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      // te agrega un campo con el nombre que quieras usando un campo de la query
      $addFields: { month: "$_id" },
    },
    // te saca el campo que quieras
    {
      $project: { _id: 0 },
    },
    // te ordena por el campo que quieras
    {
      $sort: { numTourStarts: -1 },
    },
    // te limita la cantidad de resultados
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    total: plan.length,
    data: {
      plan,
    },
  });
});

//#endregion

module.exports = {
  getAllTours,
  createTour,
  deleteTour,
  getOneTour,
  updateTour,
  checkBody,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
