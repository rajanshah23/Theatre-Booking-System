import { Router } from "express";
import { deleteAccount } from "../controllers/accountDelete";
import { asyncHandler, isUserLoggedIn } from "../middleware/authMiddleware";




const router = Router();

router.post("/delete", isUserLoggedIn, asyncHandler(deleteAccount));

export default router;
