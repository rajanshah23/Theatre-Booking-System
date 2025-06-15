import express from "express";
import showController from "../controllers/showController";
import { isUserLoggedIn, accessTo, Role } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/authMiddleware";

const router = express.Router();

// Fetch all shows
router.get("/", asyncHandler(showController.getAllShows));

// Fetch a single show
router.get("/:id", asyncHandler(showController.getSingleShow));

// Create a new show (Admin only) — image is expected as a Supabase public URL in body
router.post(
  "/",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(showController.createShow)
);

// Update a show (Admin only)
router.put(
  "/:id",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(showController.updateShow)
);

// Delete a show (Admin only)
router.delete(
  "/:id",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(showController.deleteShow)
);

// Manually seed dummy shows (Admin only)
router.post(
  "/seed",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(showController.seedShows)
);

export default router;
