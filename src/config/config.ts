import { config } from "dotenv";
import { sequelize } from "../database/connection";
const { Pool } = require("pg");
config();

export const envConfig = {
  port: process.env.PORT,
  connectionString: process.env.CONNECTION_STRING,
  jwtSecretKey: process.env.JWT_SECRET_KEY || "default-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  email: process.env.EMAIL,
  emailpassword: process.env.EMAIL_PASSWORD,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminUsername: process.env.ADMIN_USERNAME,
  ssl: { rejectUnauthorized: false },
  authorization:process.env.KHALTI_SECRET_KEY
};
export { sequelize };
