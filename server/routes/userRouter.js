const express = require('express');

const userController = require('../controllers/userController');
const userValidator = require('../utils/validators/userValidators');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.patch('/activeMe', userController.activeMe);
router.use(authController.isActive);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMyPassword',
  userValidator.updateMyPasswordValidator,
  userController.updateMyPassword,
);
router.patch(
  '/updateMe',
  userController.uploadProfileImage,
  userController.resizeProfileImage,
  userValidator.updateMeValidator,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

module.exports = router;
