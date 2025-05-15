 
import UserController from '../controllers/userController';

const router = require('express').Router();

router.route('/register').post(UserController.register);
router.route("/login").post(UserController.login)
router.route("/forgot-password").post(UserController.handleForgetPassword)

export default router;
