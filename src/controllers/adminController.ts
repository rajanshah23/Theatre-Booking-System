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
    const newShow = await Show.create(req.body);
    res.status(201).json({ success: true, show: newShow });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.findByPk(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
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
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    await show.destroy();
    res.status(200).json({ success: true, message: "Show deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
