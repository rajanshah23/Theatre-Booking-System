import express from "express";
import { upload } from "../middleware/multerMiddleware";
import showController from "../controllers/showController";
import { isUserLoggedIn, accessTo, Role } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", asyncHandler(showController.getAllShows));
router.get("/:id", asyncHandler(showController.getSingleShow));

router.post("/",isUserLoggedIn,accessTo(Role.Admin),upload.single("image"),(showController.createShow)
);

router.put( "/:id",isUserLoggedIn,accessTo(Role.Admin),upload.single("image"),asyncHandler(showController.updateShow)
);

router.delete("/:id",isUserLoggedIn,accessTo(Role.Admin),asyncHandler(showController.deleteShow)
);

router.post("/seed",isUserLoggedIn,accessTo(Role.Admin),asyncHandler(showController.seedShows)
);

export default router;
