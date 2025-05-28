import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './routes/userRoute';
import showRoute from './routes/showRoute';
import seatRoute from './routes/seatRoute';
import bookingRoutes from './routes/bookingRoute';
import reviewRoute from './routes/reviewRoute';
import path from 'path';
dotenv.config();
require('./database/connection');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Rest API is working' });
});
// In main server file (e.g., index.ts)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', userRoute);
app.use('/api/shows', showRoute);
app.use('/api/shows', seatRoute);
app.use('/api/booking', bookingRoutes);
app.use('/api/reviews', reviewRoute);

export default app;
