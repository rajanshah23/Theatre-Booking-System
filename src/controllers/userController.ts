import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../database/models/User";
import Jwt from "jsonwebtoken";
import generateOTP from "../services/generateOTP";
import sendMail from "../services/sendMail";

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

      return res.status(201).json({ message: "User registered", user: newUser });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const [user] = await User.findAll({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "No user with that email 😭" });
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = Jwt.sign({ userId: user.id }, "hahah", { expiresIn: "10d" });

    return res.status(200).json({
      message: "Logged in Successfully 🥰",
      token,
    });
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
}

export default UserController;
