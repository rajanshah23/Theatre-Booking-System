import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import userRoute from "./routes/userRoute";
import showRoute from "./routes/showRoute";
import seatRoute from "./routes/seatRoute";
import bookingRoutes from "./routes/bookingRoute";
import reviewRoute from "./routes/reviewRoute";
import adminRoute from "./routes/adminRoute";
import contactRoute from "./routes/contactRoute";
import accountRoute from "./routes/accountRoute";

import "./database/connection";

dotenv.config();

const app = express();
app.use(express.json());

 
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
const allowedOrigins = [
  "http://localhost:5173",
  "https://theatre-booking-system-delta.vercel.app/"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "REST API is working" });
});

// Routes
app.use("/api", contactRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", userRoute);
app.use("/api/shows", showRoute);
app.use("/api/shows", seatRoute);
app.use("/api/shows", bookingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoute);
app.use("/api/users", userRoute);
app.use("/api/account", accountRoute);

export default app;
