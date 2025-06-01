import { Request, Response } from "express";
import { Seat } from "../database/models/Seat";
import { Booking } from "../database/models/Booking";
import { Show } from "../database/models/Show";

export const getAvailableSeats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { showId } = req.params;

    const seats = await Seat.findAll({
      where: { showId: Number(showId) },
      order: [["seatNumber", "ASC"]],
    });

    const seatsWithStatus = seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      status: seat.isBooked ? "booked" : "available",
    }));

    res.status(200).json({ data: seatsWithStatus });
  } catch (error) {
    console.error("Error fetching seat availability:", error);
    res.status(500).json({ error: "Failed to fetch seat availability" });
  }
};

export const bookSeat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { showId } = req.params;
    const { seatNumbers } = req.body; // Expecting an array like ["C5", "C6"]

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ error: "seatNumbers (array) is required" });
    }

    const seats = await Seat.findAll({
      where: {
        showId: Number(showId),
        seatNumber: seatNumbers,
        isBooked: false,
      },
    });

    if (seats.length !== seatNumbers.length) {
      return res.status(400).json({ error: "One or more seats are already booked or invalid" });
    }

    const booking = await Booking.create({
      userId,
      showId: Number(showId),
      totalSeats: seatNumbers.length,
      status: "booked",
    });

    // Mark seats as booked
    for (const seat of seats) {
      seat.isBooked = true;
      seat.bookingId = booking.id;
      await seat.save();
    }

    res.status(200).json({ message: "Seats booked successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Booking failed" });
  }
};

export const seedSeatsForShow = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params;

    const show = await Show.findByPk(showId);
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    const existingSeats = await Seat.count({ where: { showId } });
    if (existingSeats > 0) {
      return res.status(400).json({ error: "Seats already seeded for this show" });
    }

    const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const seatsPerRow = 10;
    const seatsToCreate = [];

    for (const row of seatRows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        seatsToCreate.push({
          showId: Number(showId),
          seatNumber: `${row}${i}`,  
          bookingId: null,
        });
      }
    }

    await Seat.bulkCreate(seatsToCreate);

    res.status(201).json({ message: `Seeded ${seatRows.length * seatsPerRow} seats for show ${show.title}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to seed seats" });
  }
};
