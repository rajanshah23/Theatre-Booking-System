import { config } from "dotenv";
import { sequelize } from "../database/connection";
 config();

export const envConfig = {
  port: process.env.PORT,
  connectionString:process.env.CONNECTION_STRING,
  jwtSecretKey:process.env.JWT_SECRET_KEY  || "default-secret-key",
  jwtExpiresIn:process.env.JWT_EXPIRES_IN  || "1d"
};
 export { sequelize}