const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const deleteOnes = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'succes data deleted',
      data: null,
    });
  });

const updateOnes = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // actually as a third argument,we can also patch in some options, and we will do that.And the first option that I want to specify is newand set it to true.Because this way, then the new updated documentis the one that will be returned.
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });

const createOnes = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });
const getOnes = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document  found with that ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested Get reviews on tour  (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //here featurs is simply object in which query and querystring ours keys and in that our values is stored
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'succes',
      length: doc.length,
      data: {
        data: doc,
      },
    });
  });
module.exports = { deleteOnes, updateOnes, createOnes, getOnes, getAll };
//204 no content
