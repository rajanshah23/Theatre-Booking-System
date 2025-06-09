import { Request, Response } from "express";
import { Review } from "../database/models/Review";
import { Show } from "../database/models/Show";
import { User } from "../database/models/User";

class ReviewController {
  public createReview = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { showId, rating, comment } = req.body;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!showId || !rating) {
        return res.status(400).json({ error: "showId and rating are required" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const show = await Show.findByPk(showId);
      if (!show) {
        return res.status(404).json({ error: "Show not found" });
      }

      const review = await Review.create({ userId, showId, rating, comment });
      return res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }
  };

  public getReviewsByShow = async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.showId);
      if (isNaN(showId)) {
        return res.status(400).json({ error: "Invalid show ID" });
      }

      const reviews = await Review.findAll({
        where: { showId },
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
  };

  public getReviewsByUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const reviews = await Review.findAll({
        where: { userId },
        include: [
          {
            model: Show,
            attributes: ["id", "title", "date"],  
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching user's reviews:", error);
      return res.status(500).json({ error: "Failed to fetch user's reviews" });
    }
  };
   
  public deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

  
    if (review.userId !== Number(userId) && role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await review.destroy();
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting Review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


 
}

export default new ReviewController();
