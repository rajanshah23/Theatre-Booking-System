import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../database/models/User";
import Jwt from "jsonwebtoken";
import generateOTP from "../services/generateOTP";
import sendMail from "../services/sendMail";
import finalData from "../services/finalData";
import sendResponse from "../services/sendResponse";
import checkOtpExpiration from "../services/checkOtpExpiration";

class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10); // secure!
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "customer",
      });

      return res
        .status(201)
        .json({ message: "User registered", user: newUser });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 404, "Please provide email and password");
    }

    const user = await finalData(User, email);

    if (!user) {
      return sendResponse(res, 404, "No user with that email");
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = Jwt.sign({ userId: user.id },process.env.JWT_SECRET_KEY as string,{ expiresIn: "10d" });

    return sendResponse(res, 200, "Logged in Successfully 🥰", token);
  }

  static async handleForgetPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const [user] = await User.findAll({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOTP();

    try {
      await sendMail({
        to: email,
        subject: "Theatre Booking System",
        text: `You just requested to reset your password. Here is your OTP: ${otp}`,
      });

      user.otp = otp.toString();
      user.otpGeneratedTime = Date.now().toString();
      await user.save();

      return res.status(200).json({
        message: "Password Reset OTP sent!!!!",
      });
    } catch (error) {
      console.error("Mail sending error:", error);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }
  }
  static async verifyOtp(req: Request, res: Response) {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return sendResponse(res, 400, "Please provide OTP and email");
    }

    try {
      // First check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return sendResponse(res, 404, "No user with that email");
      }

      const otpData = await User.findOne({
        where: {
          email,
          otp: String(otp),
        },
      });

      if (!otpData) {
        return sendResponse(res, 401, "Invalid OTP");
      }

      if (!otpData.otpGeneratedTime) {
        return sendResponse(res, 500, "OTP generation time missing");
      }

      checkOtpExpiration(res, otpData.otpGeneratedTime, 120000);
      return;
    } catch (error) {
      console.error("OTP verification error:", error);
      return sendResponse(
        res,
        500,
        "Internal server error during OTP verification"
      );
    }
  }
  static async resetPassword(req: Request, res: Response) {
    const { newPassword, confirmPassword, email } = req.body;
    if (!newPassword || !confirmPassword || !email) {
      sendResponse(
        res,
        400,
        "please provide newPassword,confirmPassword,email,otp"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      sendResponse(res, 400, "Newpassword and Confirm password must be same");
      return;
    }
    const user = await finalData(User, email);
    if (!user) {
      sendResponse(res, 404, "No email with that user");
    }
    user.password = bcrypt.hashSync(newPassword, 12);
    await user.save();
    sendResponse(res, 200, "Password reset successfully!!!");
  }
    
}

export default UserController;
