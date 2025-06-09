import { Router } from "express";
import reviewController from "../controllers/reviewController";
import  { asyncHandler, isUserLoggedIn } from "../middleware/authMiddleware"; 

const router = Router();

// Create a review  
router.post("/", isUserLoggedIn, asyncHandler(reviewController.createReview));

// Get all reviews for a particular show 
router.get("/show/:showId", asyncHandler(reviewController.getReviewsByShow));

router.get("/user", isUserLoggedIn, asyncHandler(reviewController.getReviewsByUser));

router.delete("/:id", isUserLoggedIn, asyncHandler(reviewController.deleteReview));
export default router;
 