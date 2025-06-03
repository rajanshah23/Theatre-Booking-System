import express from "express";
import { getAvailableSeats, bookSeat, seedSeatsForShow } from "../controllers/seatController";
import { asyncHandler, isUserLoggedIn, accessTo, Role } from "../middleware/authMiddleware";

const router = express.Router();

// show ko lagi available seat get garni
router.get("/:showId/seats/availability", isUserLoggedIn, asyncHandler(getAvailableSeats));

//  seatbook garni show ko lagi
router.post("/:showId/seats/book", isUserLoggedIn, asyncHandler(bookSeat));

// show ko lagi seat seed garni
router.post("/:showId/seats/seed", isUserLoggedIn, accessTo(Role.Admin), asyncHandler(seedSeatsForShow));

export default router;
