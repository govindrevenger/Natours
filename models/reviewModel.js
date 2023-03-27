const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const { findByIdAndUpdate, findByIdAndDelete } = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // required: [true, 'A tour must have a rating between 1 to 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //Parent Referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   // select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //here this point to model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
//document middleware only run when new document is created and save into the database only before the new document save pre middleware run and after the save post middleware run
reviewSchema.post('save', function () {
  //this point to current review means current document
  //this.tour means current review tour
  //this.constructor means review Model
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete

//Query middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  //this.r is a object which contain the current document which is eqivalent to this keyword  in document middleware because this contain the current document so in this case this.r contain
  // console.log(this.r);
  next();
});
//again, we basically used this way here of passing the data from the pre-middleware to the post middleware, and so then here we retrieved the review document from this variable.

reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne(); does NOT work here ,query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

//here this review variable is collection
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
