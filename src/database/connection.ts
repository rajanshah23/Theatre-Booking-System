import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Show } from './models/Show';
import { Booking } from './models/Booking';
import { Seat } from './models/Seat';
import { Payment } from './models/Payment';
import { Review } from './models/Review';

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  models: [User, Show, Booking, Seat, Payment, Review],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Supabase
    },
  },
  logging: false, 
});
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error(' Database connection error:', err));

