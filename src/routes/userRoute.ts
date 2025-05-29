import UserController from '../controllers/userController';
import userMiddleware from '../middleware/userMiddleware';
const router = require('express').Router();
 

router.route('/register').post(UserController.register);
router.route("/login").post(UserController.login)
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)
router.route("/reset-password").post(UserController.resetPassword)
 // Assuming userController has these methods implemented

// In your backend routes (likely userRoutes.js)
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

export default router;