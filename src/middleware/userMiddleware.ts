import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";
import { User } from "../database/models/User";
import { Role } from "./authMiddleware"; // Make sure this is correct or import from where your Role enum is defined

class UserMiddleware {
  async isUserLoggedIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

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
            message: "Invalid token!",
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
            id: userData.id.toString(),  
            role: userData.role as Role,  
          };

          next();
        }
      }
    );
  }

  accessTo(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;

      if (!userRole || !roles.includes(userRole)) {
        res.status(403).json({
          message: "You don't have permission to access this resource!",
        });
        return;
      }

      next();
    };
  }
}

export default new UserMiddleware();
