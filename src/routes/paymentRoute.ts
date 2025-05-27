 import express from "express";
import { initiateKhaltiPayment,verifyKhaltiPayment } from "../controllers/paymentController";
import { asyncHandler } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/verify",asyncHandler(verifyKhaltiPayment));
router.post("/initiate", asyncHandler(initiateKhaltiPayment));
export default router;
