const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// @desc Finds the validation errors in the requset and warps them in an object with handy function
exports.catchError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(JSON.stringify(errors.array()), 400));
  }
  next();
};
