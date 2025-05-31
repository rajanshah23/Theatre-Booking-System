import UserController from '../controllers/userController';
import userMiddleware from '../middleware/userMiddleware';
const router = require('express').Router();
 

router.route('/register').post(UserController.register);
router.route("/login").post(UserController.login)
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)
router.route("/reset-password").post(UserController.resetPassword)
 
router.get(
  '/profile',
  userMiddleware.isUserLoggedIn,
  UserController.getProfile
);

router.get(
  '/booking-history',
  userMiddleware.isUserLoggedIn, 
  UserController.getBookingHistory
);

router.put(
  '/update',
  userMiddleware.isUserLoggedIn,
  UserController.updateProfile
);
router.put('/change-password',userMiddleware. isUserLoggedIn,UserController.changePassword);

export default router;