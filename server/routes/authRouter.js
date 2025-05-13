const express = require('express');

const authController = require('../controllers/authController');
const authValidator = require('../utils/validators/authValidators');

const router = express.Router();

router.post('/signup', authValidator.signupValidator, authController.signup);

router.post('/login', authValidator.loginValidator, authController.login);

router.post(
  '/forgotPassword',
  authValidator.emailValidator,
  authController.forgetPassword,
);

router.post(
  '/verifyResetCode',
  authValidator.verifyCodeValidator,
  authController.verifyResetCode,
);

router.post(
  '/resetPassword',
  authValidator.resetPasswordValidator,
  authController.resetPassword,
);

router.get('/logout', authController.protect, authController.logout);

module.exports = router;
