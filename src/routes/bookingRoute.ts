import express from "express";
import bookingController from "../controllers/bookingController";
import { asyncHandler, isUserLoggedIn } from "../middleware/authMiddleware";
 

const router = express.Router();

//  Available seats get garni
router.get('/:showId/seats/available', asyncHandler(bookingController.getAvailableSeats.bind(bookingController)));

// Create booking & initiate payment
router.post("/:showId/bookings", isUserLoggedIn, asyncHandler(bookingController.createBooking.bind(bookingController)))

// Confirm booking manually  
router.patch("/bookings/:bookingId/confirm", isUserLoggedIn, asyncHandler(bookingController.confirmBooking.bind(bookingController)));

// Cancel booking
router.delete("/bookings/:bookingId", isUserLoggedIn, asyncHandler(bookingController.cancelBooking.bind(bookingController)));

// Get logged-in user's bookings
router.get("/users/me/bookings", isUserLoggedIn, asyncHandler(bookingController.getUserBookings.bind(bookingController)));

// Verify Khalti payment and confirm booking
router.post("/bookings/verify-payment", isUserLoggedIn, asyncHandler(bookingController.verifyPayment.bind(bookingController)));

export default router;
