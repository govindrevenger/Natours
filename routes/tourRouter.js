const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithIn,
  getDistances,
} = require('../controllers/tourController');
const reviewRouter = require('./reviewRouter');

const tourRouter = express.Router();

//REQNAME  /tour/tourid/reviews/reviewid
//POST    /tour/234fad4/reviews
//GET     /tour/234fad4/reviews
//GET     /tour/234fad4/reviews/94887fda

tourRouter.use('/:tourId/reviews', reviewRouter);

// tourRouter.param('id', checkId);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

tourRouter.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  getTourWithIn
);
// /tour-within?distance=233&centre=-40,45&unit=mi
// /tours-within/233/centre/-40,45/unit/mi

tourRouter.get('/distances/:latlng/unit/:unit', getDistances);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
//in crud operation api we can pass two callback function into in a single api that is called chaining of middleware these crud opreation also is a middleware
// tourRouter.post('/', checkBody, createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = tourRouter;
