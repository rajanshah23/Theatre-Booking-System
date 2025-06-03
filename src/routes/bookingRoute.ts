// routes/bookingRoutes.ts
import express from "express";
import bookingController from "../controllers/bookingController";
import { asyncHandler, isUserLoggedIn } from "../middleware/authMiddleware";

const router = express.Router();

// Get available seats for a show
router.get('/:showId/seats/available', asyncHandler(bookingController.getAvailableSeats));

// Get logged-in user's bookings
router.get("/users/me/bookings", isUserLoggedIn, asyncHandler(bookingController.getUserBookings));

// Verify Khalti payment and confirm booking
router.post("/bookings/verify-payment", isUserLoggedIn, asyncHandler(bookingController.verifyPayment));

// Create booking & initiate payment
router.post("/:showId/bookings", isUserLoggedIn, asyncHandler(bookingController.createBooking));

// Confirm booking manually
router.patch("/bookings/:bookingId/confirm", isUserLoggedIn, asyncHandler(bookingController.confirmBooking));

// Cancel booking
router.delete("/bookings/:bookingId", isUserLoggedIn, asyncHandler(bookingController.cancelBooking));

export default router;