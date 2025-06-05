import express from "express";
import { isUserLoggedIn, accessTo, Role, asyncHandler } from "../middleware/authMiddleware";
import * as adminController from "../controllers/adminController";
import { upload } from "../middleware/multerMiddleware";
const router = express.Router();

router.get(
  "/shows",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(adminController.getAllShows)
);

router.post(
  "/shows",
  isUserLoggedIn,
  accessTo(Role.Admin),
    upload.single("image"),  
  asyncHandler(adminController.createShow)
);

router.put(
  "/shows/:id",
  isUserLoggedIn,
  accessTo(Role.Admin),
    upload.single("image"),  
  asyncHandler(adminController.updateShow)
);

router.delete(
  "/shows/:id",
  isUserLoggedIn,
  accessTo(Role.Admin),
  asyncHandler(adminController.deleteShow)
);

export default router;
