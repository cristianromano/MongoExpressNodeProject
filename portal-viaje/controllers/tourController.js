//const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

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

//handlers de rutas
const getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await features.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });

  // ya no es necesario la funcion catchAsync porque ya lo estamos usando en el handler de rutas
  // try {
  // } catch (error) {
  //   res.status(400).json({
  //     status: "fail",
  //     message: error.message,
  //   });
  // }
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tourDelete = await Tour.findByIdAndDelete(req.params.id);

  if (!tourDelete) {
    return next(new appError("No tour found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: tourDelete,
    message: "Tour deleted",
  });
});

const getOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new appError("No tour found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tourUpdated = await Tour.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tourUpdated) {
    return next(new appError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tourUpdated,
    },
  });
});

//https://www.mongodb.com/docs/manual/reference/operator/aggregation/month/
//Obtener estadisticas de tours
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
