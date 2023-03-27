//In Mongoose, a "document" generally means an instance of a model  You should not have to create an instance of the Document class without going through a model.
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please ptovide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //This only works on SAVE!!!

      //And so, again, keep in mind that this will only work when we create a new object, so on dot create, or on save. Okay?
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// pre works between the data recevies and persisted(save) to database
userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  //and how we basically delete the field,so not to be persisted in the databaseis to set it to undefined.
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //So putting this passwordChanged one second in the past, will then ensure that the token is always created after the password has been changed.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//querymiddleware here this middleware runs for before every query which started from find and in every middleware we usally wriiten the find query so this function runs every before time before that query

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//So an instance method is basically a method that is gonna be available on all documents of a certain collection
//here correct password is instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimestamp);
    //hamesha jwttimestamp uss time pe issue hoga jiss time pe ham login karenge aur agar password changed nahi hua h to simply si baat h ki jwttimestamp always bada hi hoga abb manlo ki login ke baad ksis ne passowrd change kiya to jiss time pe password changed hua wo wala time stamp store ho jayega aur obivsoly h ki jab password changed hua h wo wala time stamp baba hi hoga login wale time stamp se
    return JWTTimestamp < changedTimeStamp;
  }
  //false means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  // +minutes(10)*sec(60)*milisecond(1000)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // we just want to simply send unencrypted resetToken to user email and store encrypted token in database same as password because suppose if some how hacker get the access of database then they try to reset the password so whey they reset the password then in databse if they found unencrypted token then they simply copy that token and change the password that' why we encypted the toekn and password but in gernal there is no use of that simply useless
  return resetToken;
};
//all the method present on the document not on the model i think but i'm not sure about it
//here user variable is document
const User = mongoose.model('User', userSchema);

module.exports = User;

//A Mongoose model is a wrapper on the Mongoose schema. A Mongoose schema defines the structure of the document, default values, validators, etc., whereas a Mongoose model provides an interface to the database for creating, querying, updating, deleting records, etc
