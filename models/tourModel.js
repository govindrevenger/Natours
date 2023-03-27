//in moongose you can simply change schema defination by just simply comes into schema defination file and add new field and save it so that schema change is applicable into your mongodb database we don't have to do  force:true just like in postgress
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');
// I said that into this Mongoose.schema,we can pass in not only the objec with the schema definition itself,but also an object for the schema options.
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name '],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
      minLength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters '],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration '],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size '],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty '],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either: easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // So again, a setter function here which is going to be run each time that there is a new value for the ratings average field.
      set: (val) => Math.round(val * 10) / 10, //4.66666,46.666, 47,4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only point to current doc on new document creation
          return val < this.price;
        },
        message: 'discount price ({VALUE}) should be below regular price',
      },
    },

    summary: {
      type: String,
      //trim only works for string type field
      trim: true,
      required: [true, 'A tour must have a summary '],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image '],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //geoJSON
      // this object here is actually really an embedded object. And so inside this object we can specify a couple of properties.

      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //child referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//index need to be unquie
// tourSchema.index({ price: 1 });

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//here we use get method for which whenever user want some data Now in here we pass a function, and actually this call back function is gonna be a real function, so not an arrow function, because because remember, an arrow function does not get its own disk keyword.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE : runs before .save() and .create()
//here hook is save means event so this middleware is called pre save hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query MIDDLEWARE
///^find/ means  all whose start with find
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
//cmd+k for all clear

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

// inside the model Tour is wriiten in string so in mongodb exactly this same name model is created and whatever data is saved inside model is saved in a form of object so all that data stored in Tour variable
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
