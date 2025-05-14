import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../database/models/User";
  

class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      console.log("Received body:", req.body);

      const newUser = await User.create({
        username,
        email,
        password,
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
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "No user with that email 😭",
      });
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }
        
    return res.status(200).json({
      message: "Logged in Success 🥰",
    });
  }
}

export default UserController;
