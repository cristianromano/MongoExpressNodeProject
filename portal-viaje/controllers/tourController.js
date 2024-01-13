//const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
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
const getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tourDelete = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: tourDelete,
      message: "Tour deleted",
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const getOneTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tourUpdated = await Tour.findOneAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: tourUpdated,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

//https://www.mongodb.com/docs/manual/reference/operator/aggregation/month/
//Obtener estadisticas de tours
const getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

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
