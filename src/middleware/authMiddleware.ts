import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database/models/User";

export enum Role {
  User = "user",
  Admin = "admin"
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

interface JwtPayload {
  id: string;
}

 
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
 
export const isUserLoggedIn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.query?.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  req.user = {
    id: user.id,
    role: user.role as Role,
  };

  next();
});

 
export const accessTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource"
      });
      return;  
    }
    next();
  };
};

export default {
  isUserLoggedIn,
  accessTo,
  Role
};
