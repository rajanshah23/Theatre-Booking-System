 
import UserController from '../controllers/userController';

const router = require('express').Router();

router.route('/register').post(UserController.register);
router.route("/login").post(UserController.login)
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)
router.route("/reset-password").post(UserController.resetPassword)

export default router;
