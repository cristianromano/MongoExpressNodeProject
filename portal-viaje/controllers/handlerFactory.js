const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new appError("No tour found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: doc,
      message: "Tour deleted",
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new appError("No tour found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc: doc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new appError("No tour found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });

module.exports = {
  deleteOne,
  updateOne,
  createOne,
  getAll,
  getOne,
};
