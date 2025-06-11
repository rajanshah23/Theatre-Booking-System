import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { User } from "../database/models/User";
import { Booking } from "../database/models/Booking";
import { Show } from "../database/models/Show";
import generateOTP from "../services/generateOTP";
import sendMail from "../services/sendMail";
import sendResponse from "../services/sendResponse";

class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return sendResponse(
          res,
          400,
          "Username, email and password are required"
        );
      }

      if (password.length < 6) {
        return sendResponse(res, 400, "Password must be at least 6 characters");
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return sendResponse(res, 400, "Email already registered");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "customer",
      });

      return sendResponse(res, 201, "User registered successfully", {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return sendResponse(res, 500, "Internal server error");
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendResponse(res, 400, "Email and password are required");
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return sendResponse(res, 404, "User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendResponse(res, 401, "Invalid credentials");
      }

      if (user.email === "admin@gmail.com") {
        user.role = "admin";
        await user.save();
      }

      const token = Jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "10d" }
      );
      return sendResponse(res, 200, "Login successful", {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return sendResponse(res, 500, "Internal server error");
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return sendResponse(res, 404, "User not found");
      }

      return sendResponse(res, 200, "Profile retrieved successfully", user);
    } catch (error) {
      console.error("Profile error:", error);
      return sendResponse(res, 500, "Error fetching profile");
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendResponse(res, 401, "Unauthorized");

      const { username, email } = req.body;
      const user = await User.findByPk(userId, {
        attributes: ["id", "username", "email", "role"],
      });

      if (!user) return sendResponse(res, 404, "User not found");

      user.username = username || user.username;
      user.email = email || user.email;
      await user.save();

      return sendResponse(res, 200, "Profile updated successfully", user);
    } catch (error) {
      console.error("Update profile error:", error);
      return sendResponse(res, 500, "Server error");
    }
  }

  static async getBookingHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendResponse(res, 401, "Unauthorized");

      const bookings = await Booking.findAll({
        where: { userId },
        include: [
          {
            model: Show,
            attributes: ["title", "date", "time"],
          },
        ],
      });

      return sendResponse(
        res,
        200,
        "Booking history retrieved successfully",
        bookings
      );
    } catch (error) {
      console.error("Get booking history error:", error);
      return sendResponse(res, 500, "Server error");
    }
  }

  static async handleForgetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log("handleForgetPassword: email =", email);
      if (!email) return sendResponse(res, 400, "Email is required");

      const user = await User.findOne({ where: { email } });
      if (!user) return sendResponse(res, 404, "Email not registered");

      const otp = generateOTP();
      const otpExpiration = Date.now() + 120000;

      await sendMail({
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp} (valid for 2 minutes)`,
      });

      await user.update({
        otp: otp.toString(),
        otpGeneratedTime: otpExpiration.toString(),
      });
      return sendResponse(res, 200, "OTP sent successfully");
    } catch (error) {
      console.error("Forgot password error:", error);
      return sendResponse(res, 500, "Failed to process request");
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { otp, email } = req.body;
      console.log("verifyOtp: email =", email);
      if (!otp || !email)
        return sendResponse(res, 400, "OTP and email are required");

      const user = await User.findOne({ where: { email } });
      if (!user) return sendResponse(res, 404, "User not found");

      if (user.otp !== otp.toString())
        return sendResponse(res, 401, "Invalid OTP");

      if (
        !user.otpGeneratedTime ||
        Date.now() > parseInt(user.otpGeneratedTime)
      ) {
        return sendResponse(res, 401, "OTP expired");
      }

      return sendResponse(res, 200, "OTP verified successfully");
    } catch (error) {
      console.error("OTP verification error:", error);
      return sendResponse(res, 500, "Internal server error");
    }
  }

  static async resetPassword(req: Request, res: Response) {
  try {
    const { newPassword, confirmPassword, email } = req.body;

    console.log("Reset Password Body:", req.body);

 
    if (!email || typeof email !== "string" || email.trim() === "") {
      console.error(" Email is missing or invalid:", email);
      return sendResponse(res, 400, "Email is required and must be a valid string");
    }

    if (!newPassword || !confirmPassword) {
      return sendResponse(res, 400, "Both password fields are required");
    }

    if (newPassword !== confirmPassword) {
      return sendResponse(res, 400, "Passwords do not match");
    }

    if (newPassword.length < 6) {
      return sendResponse(res, 400, "Password must be at least 6 characters");
    }
 
    const trimmedEmail = email.trim();
    console.log("Looking up user with email:", trimmedEmail);

    const user = await User.findOne({ where: { email: trimmedEmail } });

    if (!user) {
      console.error("❌ User not found:", trimmedEmail);
      return sendResponse(res, 404, "User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      {
        password: hashedPassword,
        otp: null,
        otpGeneratedTime: null,
      },
      {
        where: { id: user.id },
      }
    );

    return sendResponse(res, 200, "Password reset successfully");
  } catch (error) {
    console.error("Reset Password Error:", error);
    return sendResponse(res, 500, "Internal server error");
  }
}

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendResponse(res, 400, "Current and new passwords are required");
      }

      if (newPassword.length < 6) {
        return sendResponse(
          res,
          400,
          "New password must be at least 6 characters"
        );
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return sendResponse(res, 404, "User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendResponse(res, 400, "Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
      console.error("Change password error:", error);
      return sendResponse(res, 500, "Internal server error");
    }
  }
}

export default UserController;
