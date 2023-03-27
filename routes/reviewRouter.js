const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter.get('/', getAllReview);

//whenever you want to pass an argument in the call back function which is return in controllers folder so simply you have to return the function from that function by which you can acces the parameter  of that function
reviewRouter.post('/', restrictTo('user'), setTourUserIds, createReview);
reviewRouter.get('/:id', getReview);

reviewRouter.delete('/:id', restrictTo('user', 'admin'), deleteReview);
reviewRouter.patch('/:id', restrictTo('user', 'admin'), updateReview);

module.exports = reviewRouter;

//both req.params and req.query are js objects

//req.params means after the semiclon: whatever we write in the path till the next slash (/) in the path that are params
//req.query whatever we write in the after the question mark that all are comes in query object
