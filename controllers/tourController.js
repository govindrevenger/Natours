// const { default: dist } = require('express-rate-limit');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOnes,
  updateOnes,
  createOnes,
  getOnes,
  getAll,
} = require('./handleFactory');
//in a single function we cannot send two times response supoose in if condition if you not return res then it doesn't mean that our next line of code of  stop in function .because our function only stop when it will complete all line of code inside the function or it will encounter any return statement

//by just writing res.send doesn't mean that our function will stop at that point.our function is not stop until  all line of code will execute inside the function or it encounter the return statement in the middle

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// const getAllTours = catchAsync(async (req, res, next) => {
//   //BUILD QUERY
//   // console.log(req.query);
//   //1A) Filtering
//   // const queryObject = { ...req.query };
//   // const excludedFeilds = ['page', 'sort', 'limit', 'fields'];

//   // excludedFeilds.forEach((el) => delete queryObject[el]);

//   // //1B) Advanced filtering
//   // let queryStr = JSON.stringify(queryObject);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   // let query = Tour.find(JSON.parse(queryStr));

//   //2) SORTING

//   //3) FIELDS

//   //4) Pagination

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour, req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   //here featurs is simply object in which query and querystring ours keys and in that our values is stored
//   const tours = await features.query;

//   //query.sort().select().skip().limit()

//   // const query = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'succes',
//     length: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
const getAllTours = getAll(Tour);

const getTour = getOnes(Tour, { path: 'reviews' });

// const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(200).json({
//     status: 'succes',
//     data: {
//       tour: newTour,
//     },
//   });
//   // try {

//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });
const createTour = createOnes(Tour);
const updateTour = updateOnes(Tour);
// const updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     // actually as a third argument,we can also patch in some options, and we will do that.And the first option that I want to specify is newand set it to true.Because this way, then the new updated documentis the one that will be returned.
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'succes',
//     data: {
//       tour,
//     },
//   });
// });
const deleteTour = deleteOnes(Tour);
// const deleteTour = catchAsync(async (req, res, next) => {
//   const removeTour = await Tour.findByIdAndDelete(req.params.id);
//   if (!removeTour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'succes data deleted',
//     data: removeTour,
//   });
// });

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //here we can group the tours on the basis of our crtiteria only you need to pass that criteria into _id
        _id: { $toUpper: '$difficulty' },
        //these are the charactertic or features we want to see in the group
        // here for each tour 1 will be added in numTours counter
        numTours: { $sum: 1 },
        //this numRatings are the field which is see in output
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
    //here in sort 1 means in acsending
  ]);
  res.status(200).json({
    status: 'succes',
    data: {
      stats,
    },
  });
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    //always whenever we write any field in string then we hav to use $ sign before the value
    {
      $unwind: '$startDates',
    },
    {
      //in the object if we want to use opreator at the place of key then in place of value we use $ sign in quotes with the name of field on which we want to perform that opreations if we use object in place of value then we can't use $ sign obviously because we only use $ sign only with  string field
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //$month is opreator of mongodb
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      //-1 for decsending and 1 for acsending
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'succes',
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit

const getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  //latlng comes in string
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude int this format lat,lng',
        400
      )
    );
  }
  // console.log(distance, latlng, unit, req.params);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  //latlng comes in string
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude int this format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        //distanceField is the property if geoNear object
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    data: {
      data: distances,
    },
  });
});
module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithIn,
  getDistances,
};
