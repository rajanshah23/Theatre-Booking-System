import { config } from "dotenv";
import { sequelize } from "../database/connection";
config();

export const envConfig = {
  port: process.env.PORT,
  connectionString:process.env.CONNECTION_STRING
};
 export { sequelize}