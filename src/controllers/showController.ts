import { Request, Response } from "express";
import { Show } from "../database/models/Show";
import sendResponse from "../services/sendResponse";
import { Op } from "sequelize";  
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface ShowRequestBody {
  showTitle?: string;
  showDescription?: string;
  showDate?: string;
  showTime?: string;
  showTotalSeats?: number;
  price?: number;  
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
          price: 500,  
          image: "https://i.gadgets360cdn.com/products/large/Final-Destination-Bloodlines-2-1422x800-1743500570068.jpg?downsize=*:420 ",
        },
        {
          title: "Jaari",
          description: "A social drama about a Limbu couple...",
          date: "2025-06-02",
          time: "20:00",
          totalSeats: 80,
          price: 500,  
          image: "https://imgs.search.brave.com/zmakM_c-sciQbi825kd73kaAhZw4ri_igBBwvRxwAtM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk16STJOalpp/TkdNdE5tWTVNQzAw/WTJKbExXRm1ZMlF0/TkRVMk5tTTRPR05s/WW1GaFhrRXlYa0Zx/Y0djQC5qcGc  ",
        },
        {
          title: "Unko Sweater-The Woolen Sweater",
          description: "A comedy about a magical sweater...",
          date: "2025-06-03",
          time: "17:30",
          totalSeats: 120,
          price: 500,  
          image: "https://imgs.search.brave.com/AFZuopO2WY5iQn61c2LRDKyiSjR1bWFMvZYnLoTjQTY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMzJx/eXM5YTZ3bTluby5j/bG91ZGZyb250Lm5l/dC9pbWFnZXMvbW92/aWVzL3Bvc3Rlci9i/ZS8xMTAyZDUzYjFh/ODAwMmJiZTcyMTAy/MzFjMDZkNWM2ZV8z/MDB4NDQyLmpwZz90/PTE3NDY1Nzc3MDE",
        },
      ];

      await Show.bulkCreate(dummyShows);
      console.log(" Successfully auto-seeded", dummyShows.length, "shows");
    } catch (error) {
      console.error(" Auto-seeding failed:", error);
    }
  }

  async createShow(req: MulterRequest, res: Response): Promise<void> {
    try {
    
      const { showTitle, showDescription, showDate, showTime, showTotalSeats, price } = req.body;

      const filename = req.file
        ? req.file.filename
        : "https://weimaracademy.org/wp-content/uploads/2021/08/dummy-user.png";

    
      if (!showTitle || !showDate || !showTime || !showTotalSeats || !price) {
        sendResponse(
          res,
          400,
          "Missing required fields: showTitle, showDate, showTime, showTotalSeats, price"
        );
        return;
      }

 
      if (isNaN(Number(price))) {
        sendResponse(res, 400, "Price must be a valid number");
        return;
      }

      if (Number(price) <= 0) {
        sendResponse(res, 400, "Price must be greater than 0");
        return;
      }

    
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
        price: Number(price), // Add price
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
      const id = Number(req.params.id);   

      if (isNaN(id)) {
        sendResponse(res, 400, "Invalid show ID");
        return;
      }

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
    
      const { showTitle, showDescription, showDate, showTime, showTotalSeats, price } = req.body;
      const filename = req.file?.filename;

      const show = await Show.findByPk(id);
      if (!show) {
        sendResponse(res, 404, "Show not found");
        return;
      }
 
      if (price !== undefined) {
        if (isNaN(Number(price))) {
          sendResponse(res, 400, "Price must be a valid number");
          return;
        }
        if (Number(price) <= 0) {
          sendResponse(res, 400, "Price must be greater than 0");
          return;
        }
      }

       
      if (showDate || showTime) {
        const targetDate = showDate || show.date;
        const targetTime = showTime || show.time;

        const overlappingShow = await Show.findOne({
          where: {
            date: targetDate,
            time: targetTime,
            id: { [Op.ne]: id }  
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
        price: price !== undefined ? Number(price) : show.price,  
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