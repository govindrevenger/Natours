const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const {
  deleteOnes,
  updateOnes,
  createOnes,
  getOnes,
  getAll,
} = require('./handleFactory');

const getAllReview = getAll(Review);

const setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const getReview = getOnes(Review);
const createReview = createOnes(Review);
const deleteReview = deleteOnes(Review);
const updateReview = updateOnes(Review);
module.exports = {
  createReview,
  getAllReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
