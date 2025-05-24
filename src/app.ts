import express from "express";
import userRoute from "./routes/userRoute";
import dotenv from "dotenv";
import showRoute from "./routes/showRoute";
import seatRoute from "./routes/seatRoute";
import bookingRoutes from "./routes/bookingRoute";

dotenv.config();
require("./database/connection");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Rest API is working",
  });
});

app.use("/api/auth", userRoute);
app.use("/api/shows", showRoute);
app.use("/api/shows", seatRoute);
app.use("/api/booking", bookingRoutes);

export default app;
