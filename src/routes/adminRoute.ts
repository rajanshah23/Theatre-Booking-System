import express from "express";
import {isUserLoggedIn,accessTo,
  Role,
  asyncHandler,
} from "../middleware/authMiddleware";
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

 
router.get("/users", asyncHandler(adminController.getAllUsers));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));
router.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));

router.get("/payments",asyncHandler(adminController.getAllPayments))
router.patch("/payments/:id/status",asyncHandler(adminController.updatePaymentStatus))


router.get("/bookings",asyncHandler(adminController.getAllBookings))
router.patch("/bookings/:id/status",asyncHandler(adminController.updateBookingStatus))


export default router;
