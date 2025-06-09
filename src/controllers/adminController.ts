import { Request, Response } from "express";
import { Show } from "../database/models/Show";
import { User } from "../database/models/User";
import { Payment } from "../database/models/Payment";
import { Booking } from "../database/models/Booking";
import { Seat } from "../database/models/Seat";


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
      showTitle,  
      showDescription,  
      showDate,  
      showTime,  
      showTotalSeats,  
      price,  
    } = req.body;

    const image = req.file?.filename;

    
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
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "createdAt"],
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role specified" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${role}` });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Booking,
          include: [User, Show],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payments", error });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.findAll({
      include: [User, Show, Seat],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "booked", "cancelled", "confirmed"].includes(status)) {
    return res.status(400).json({ message: "Invalid booking status" });
  }

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status as any;
    await booking.save();

    res.status(200).json({ message: `Booking status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking status", error: err });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["successful", "failed", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  try {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = status as any;
    await payment.save();

    res.status(200).json({ message: `Payment marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Error updating payment status", error: err });
  }
};
