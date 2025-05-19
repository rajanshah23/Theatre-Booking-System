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
      where: { showId, isBooked: false },
      order: [["seatNumber", "ASC"]],
    });

    res.status(200).json(seats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
};

 
export const bookSeat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { showId } = req.params;
    const { seatNumber } = req.body;

    if (!seatNumber) {
      return res.status(400).json({ error: "seatNumber is required" });
    }

    const seat = await Seat.findOne({
      where: { showId, seatNumber },
    });

    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (seat.isBooked) {
      return res.status(400).json({ error: "Seat already booked" });
    }

    const booking = await Booking.create({
      userId,
      showId: Number(showId),
      seatId: seat.id,
      status: "booked",
        totalSeats: 1 
    });

    seat.isBooked = true;
    seat.bookingId = booking.id;
    await seat.save();

    res.status(200).json({ message: "Seat booked successfully", booking });
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

    const totalSeats = show.totalSeats;
    const seatsToCreate = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatsToCreate.push({
        showId: show.id,
        seatNumber: i.toString(),
        isBooked: false,
        bookingId: null,
      });
    }

    await Seat.bulkCreate(seatsToCreate);

    res.status(201).json({ message: `Seeded ${totalSeats} seats for show ${show.title}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to seed seats" });
  }
};
