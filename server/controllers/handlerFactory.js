const catchAsync = require('express-async-handler');
const AppFeatures = require('../utils/AppFeatures');
const AppError = require('../utils/AppError');

exports.getOne = (Model, populationOpt = '') =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // If the population
    if (populationOpt) query.populate(populationOpt);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, populationOpts = '') =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.filterObj) filter = { ...req.filterObj };

    const docsCount = await Model.countDocuments();
    let queryBuilder = Model.find(filter);
    if (populationOpts) {
      if (Array.isArray(populationOpts)) {
        populationOpts.forEach((opt) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      } else {
        queryBuilder = queryBuilder.populate(populationOpts);
      }
    }

    const features = new AppFeatures(queryBuilder, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(docsCount)
      .keyWordsSearch(populationOpts);

    const { query, paginationResults } = features;
    const docs = await query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      paginationResults,
      data: {
        data: docs,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
