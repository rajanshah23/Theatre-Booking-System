import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";
import UserController from "../controllers/userController";
import { User } from "../database/models/User";

export enum Role {
  Admin = "admin",
  Customer = "customer",
}

interface IExtendedRequest extends Request {
  user?: {
    username: string;
    email: string;
    role: string;
    password: string;
    id: number;
  };
}
class UserMiddleware {
  async isUserLoggedIn(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = req.headers.authorization;
    if (!token) {
      res.status(403).json({
        message: "Token must be provided",
      });
      return;
    }

    jwt.verify(
      token,
      envConfig.jwtSecretKey as string,
      async (err, result: any) => {
        if (err) {
          res.status(403).json({
            message: "Invalid token !!!",
          });
        } else {
          const userData = await User.findByPk(result.userId);
          if (!userData) {
            res.status(404).json({
              message: "No user with that userId",
            });
            return;
          }
          req.user = {
            id: userData.id!,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            password: userData.password,
          };
          next();
        }
      }
    );
  }
  accessTo(...roles: Role[]) {
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
      let userRole = req.user?.role as Role;
      if (!roles.includes(userRole)) {
        res.status(403).json({
          message: "You dont have permission haiii!!",
        });
        return;
      }
      next();
    };
  }
}

export default new UserMiddleware();
