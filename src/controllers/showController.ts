import { Request, Response } from "express";
import { Show } from "../database/models/Show";
import sendResponse from "../services/sendResponse";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface ShowRequestBody {
  showTitle?: string;
  showDescription?: string;
  showDate?: string;
  showTime?: string;
  showTotalSeats?: number;
}

class ShowController {
  constructor() {
    this.autoSeedShows().catch(console.error);
  }

  private async autoSeedShows(): Promise<void> {
    try {
      const showCount = await Show.count();
      if (showCount > 0) {
        console.log("🔄 Shows already exist in database - skipping auto-seed");
        return;
      }

      const dummyShows = [
        {
          title: "Final Destination: Bloodlines",
          description: "One of the most-awaited thriller and horror movie...",
          date: "2025-05-15",
          time: "18:00",
          totalSeats: 100,
          image: "https://example.com/image1.jpg",
        },
        {
          title: "Jaari",
          description: "A social drama about a Limbu couple...",
          date: "2025-06-02",
          time: "20:00",
          totalSeats: 80,
          image: "https://example.com/image2.jpg",
        },
        {
          title: "Unko Sweater-The Woolen Sweater",
          description: "A comedy about a magical sweater...",
          date: "2025-06-03",
          time: "17:30",
          totalSeats: 120,
          image: "https://example.com/image3.jpg",
        },
      ];

      await Show.bulkCreate(dummyShows);
      console.log("✅ Successfully auto-seeded", dummyShows.length, "shows");
    } catch (error) {
      console.error("❌ Auto-seeding failed:", error);
    }
  }

  async createShow(req: MulterRequest, res: Response): Promise<void> {
    try {
      const { showTitle, showDescription, showDate, showTime, showTotalSeats } = req.body;

      const filename = req.file
        ? req.file.filename
        : "https://weimaracademy.org/wp-content/uploads/2021/08/dummy-user.png";

      if (!showTitle || !showDate || !showTime || !showTotalSeats) {
        sendResponse(
          res,
          400,
          "Missing required fields: showTitle, showDate, showTime, showTotalSeats"
        );
        return;
      }

      // Check for overlapping shows
      const overlappingShow = await Show.findOne({
        where: {
          date: showDate,
          time: showTime,
        },
      });

      if (overlappingShow) {
        sendResponse(res, 409, "A show already exists at this date and time");
        return;
      }

      const show = await Show.create({
        title: showTitle,
        description: showDescription || null,
        date: showDate,
        time: showTime,
        totalSeats: showTotalSeats,
        image: filename,
      });

      sendResponse(res, 201, "Show created successfully", show);
    } catch (error: any) {
      sendResponse(res, 500, "Error creating show", error.message);
    }
  }

  async getAllShows(req: Request, res: Response): Promise<void> {
    try {
      const shows = await Show.findAll({
        order: [["date", "ASC"], ["time", "ASC"]],
      });
      
      sendResponse(res, 200, "Shows retrieved successfully", shows);
    } catch (error: any) {
      sendResponse(res, 500, "Error fetching shows", error.message);
    }
  }

  async getSingleShow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const show = await Show.findByPk(id);

      if (!show) {
        sendResponse(res, 404, "Show not found");
        return;
      }

      sendResponse(res, 200, "Show retrieved successfully", show);
    } catch (error: any) {
      sendResponse(res, 500, "Error fetching show", error.message);
    }
  }

  async updateShow(req: MulterRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { showTitle, showDescription, showDate, showTime, showTotalSeats } = req.body;
      const filename = req.file?.filename;

      const show = await Show.findByPk(id);
      if (!show) {
        sendResponse(res, 404, "Show not found");
        return;
      }

      // Check for time slot conflicts (excluding current show)
      if (showDate || showTime) {
        const targetDate = showDate || show.date;
        const targetTime = showTime || show.time;

        const overlappingShow = await Show.findOne({
          where: {
            date: targetDate,
            time: targetTime,

          },
        });

        if (overlappingShow) {
          sendResponse(res, 409, "Another show already exists at this time");
          return;
        }
      }

      await show.update({
        title: showTitle || show.title,
        description: showDescription || show.description,
        date: showDate || show.date,
        time: showTime || show.time,
        totalSeats: showTotalSeats || show.totalSeats,
        image: filename || show.image,
      });

      sendResponse(res, 200, "Show updated successfully", show);
    } catch (error: any) {
      sendResponse(res, 500, "Error updating show", error.message);
    }
  }

  async deleteShow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedCount = await Show.destroy({ where: { id } });

      if (deletedCount === 0) {
        sendResponse(res, 404, "Show not found");
        return;
      }

      sendResponse(res, 200, "Show deleted successfully");
    } catch (error: any) {
      sendResponse(res, 500, "Error deleting show", error.message);
    }
  }

  async seedShows(req: Request, res: Response): Promise<void> {
    try {
      const existingCount = await Show.count();
      if (existingCount > 0) {
        sendResponse(res, 200, "Shows already exist in database");
        return;
      }

      await this.autoSeedShows();
      sendResponse(res, 200, "Shows seeded successfully");
    } catch (error: any) {
      sendResponse(res, 500, "Error seeding shows", error.message);
    }
  }
}

export default new ShowController();