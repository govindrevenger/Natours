const catchAsync = (fn) => (req, res, next) => {
  //this fn is async function that's why is return promises to catch the error we uses here catch block it is not neccesary before using catch you have to use then
  fn(req, res, next).catch(next);
  //   fn(req, res, next).catch((err) => next(err));
};

module.exports = catchAsync;
