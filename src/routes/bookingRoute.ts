import express from "express";
import bookingController from "../controllers/bookingController";
import { asyncHandler, isUserLoggedIn } from "../middleware/authMiddleware";

const router = express.Router();

router.get('/:showId/seats/available',asyncHandler(bookingController.getAvailableSeats.bind(bookingController))
);

//  booking create garni
router.post("/:showId/bookings", isUserLoggedIn, asyncHandler(bookingController.createBooking.bind(bookingController)));

//   booking confirm garni
router.patch("/bookings/:bookingId/confirm", isUserLoggedIn, asyncHandler(bookingController.confirmBooking.bind(bookingController)));

//  booking cancel garni
router.delete("/bookings/:bookingId", isUserLoggedIn, asyncHandler(bookingController.cancelBooking.bind(bookingController)));

// Get user bookings
router.get("/users/me/bookings", isUserLoggedIn, asyncHandler(bookingController.getUserBookings.bind(bookingController)));

export default router;
