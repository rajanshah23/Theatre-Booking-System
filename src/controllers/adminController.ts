import { Request, Response } from "express";
import { Show } from "../database/models/Show";

export const getAllShows = async (req: Request, res: Response) => {
  try {
    const shows = await Show.findAll();
    res.status(200).json({ success: true, shows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createShow = async (req: Request, res: Response) => {
  try {
    const {
      showTitle, // Corrected field name
      showDescription, // Corrected field name
      showDate, // Corrected field name
      showTime, // Corrected field name
      showTotalSeats, // Corrected field name
      price, // Added price
    } = req.body;

    const image = req.file?.filename;

    // Check all required fields exist
    if (
      !showTitle ||
      !showDate ||
      !showTime ||
      !showTotalSeats ||
      !price ||
      !image
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newShow = await Show.create({
      title: showTitle,
      description: showDescription,
      date: showDate,
      time: showTime,
      totalSeats: parseInt(showTotalSeats),
      price: parseFloat(price),
      image,
    });

    return res.status(201).json({ success: true, data: newShow });
  } catch (error: any) {
    console.error("Error creating show:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.findByPk(req.params.id);
    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Show not found" });
    }
    await show.update(req.body);
    res.status(200).json({ success: true, show });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.findByPk(req.params.id);
    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Show not found" });
    }
    await show.destroy();
    res.status(200).json({ success: true, message: "Show deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
