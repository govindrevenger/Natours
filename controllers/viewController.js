// const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

const getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template
  //3) Render that template usingtour data from 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res) => {
  //1) get the data for the requested tour (including reviews and user )

  // we can only populate those field  which is present in model so here reviews is not define in model but we populate virtually that why we can populate reviews on tour document
  const tour = await Tour.find({ slug: req.params.slug }).populate({
    path: 'reviews',
    feilds: 'review rating user',
  });
  //here tour is comes in an  array  means array of objects
  //   res.status(200).json({
  //     status: 'succes',
  //     tour,
  //   });
  //   console.log(tourOne);
  res.status(200).render('tour', {
    title: `${tour[0].name} Tour `,
    tour,
  });
});

module.exports = { getOverview, getTour };
