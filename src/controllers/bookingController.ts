import { Request, Response } from "express";
import { Booking } from "../database/models/Booking";
import { Seat } from "../database/models/Seat";
import { Show } from "../database/models/Show";
import { Transaction } from "sequelize";
import axios from "axios";

class BookingController {
  public getAvailableSeats = async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.showId);
      if (isNaN(showId)) {
        return res.status(400).json({ error: "Invalid showId" });
      }

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

  public createBooking = async (req: Request, res: Response) => {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { showId } = req.params;
      const { seatIds, totalAmount, paymentMethod } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "seatIds must be a non-empty array" });
      }

      const seats = await Seat.findAll({
        where: {
          id: seatIds,
          showId,
          isBooked: false,
        },
        transaction,
      });

      if (seats.length !== seatIds.length) {
        await transaction.rollback();
        return res.status(409).json({ error: "Some seats are already booked or invalid" });
      }

      const booking = await Booking.create(
        {
          userId,
          showId: Number(showId),
          totalSeats: seatIds.length,
          status: "pending",
        },
        { transaction }
      );

      await transaction.commit();

      if (paymentMethod === "Khalti") {
        const data = {
          return_url: "http://localhost:5173/",
          website_url: "http://localhost:5173/",
          amount: totalAmount * 100,
          purchase_order_id: booking.id,
          purchase_order_name: `order_${booking.id}`,
        };

        const response = await axios.post(
          "https://a.khalti.com/api/v2/epayment/initiate/",
          data,
          {
            headers: {
              Authorization: "Key a2cede7e801a4fe7a057c80ba2f526e5",
            },
          }
        );

        await booking.update({ pidx: response.data.pidx });

        return res.status(200).json({
          message: "Booking created and payment initiated",
          booking,
          paymentUrl: response.data.payment_url,
          pidx: response.data.pidx,
        });
      }

      return res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
      await transaction.rollback();
      console.error("Booking failed:", error);
      return res.status(500).json({ error: "Booking failed", details: (error as Error).message });
    }
  };

  public verifyPayment = async (req: Request, res: Response) => {
    try {
      const { pidx } = req.body;
      if (!pidx) {
        return res.status(400).json({ message: "Please provide pidx" });
      }

      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/lookup/",
        { pidx },
        {
          headers: {
            Authorization: "Key a2cede7e801a4fe7a057c80ba2f526e5",
          },
        }
      );

      const data = response.data;
      console.log("Khalti lookup response:", data);

      if (data.status === "Completed") {
        const booking = await Booking.findOne({
          where: { pidx },
          include: [Seat],
        });

        if (!booking) {
          return res.status(404).json({ message: "Booking not found for this pidx" });
        }

        const transaction: Transaction = await Booking.sequelize!.transaction();

        const seatIds = booking.seats?.map((seat) => seat.id) || [];

        if (seatIds.length === 0) {
          await transaction.rollback();
          return res.status(400).json({ message: "No seats associated with booking" });
        }

        const seats = await Seat.findAll({
          where: {
            id: seatIds,
            isBooked: false,
          },
          transaction,
        });

        if (seats.length !== seatIds.length) {
          await transaction.rollback();
          return res.status(409).json({ message: "Some seats already booked by others" });
        }

        await Promise.all(
          seats.map((seat) =>
            seat.update({ isBooked: true, bookingId: booking.id }, { transaction })
          )
        );

        await booking.update({ status: "booked" }, { transaction });
        await transaction.commit();

        return res.status(200).json({ message: "Payment verified and booking confirmed!" });
      } else {
        return res.status(400).json({ message: "Payment not completed or failed" });
      }
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ message: "Payment verification failed" });
    }
  };

  public confirmBooking = async (req: Request, res: Response) => {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByPk(bookingId, {
        include: [Seat],
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "pending") {
        await transaction.rollback();
        return res.status(400).json({ error: "Only pending bookings can be confirmed" });
      }

      const seats = await Seat.findAll({
        where: {
          id: booking.seats.map((seat) => seat.id),
          isBooked: false,
        },
        transaction,
      });

      if (seats.length !== booking.seats.length) {
        await transaction.rollback();
        return res.status(409).json({ error: "Some seats have already been booked" });
      }

      await Promise.all(
        seats.map((seat) =>
          seat.update({ isBooked: true, bookingId: booking.id }, { transaction })
        )
      );

      await booking.update({ status: "booked" }, { transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Booking confirmed", booking });
    } catch (error) {
      await transaction.rollback();
      console.error("Confirmation failed:", error);
      return res.status(500).json({ error: "Confirmation failed" });
    }
  };

  public cancelBooking = async (req: Request, res: Response) => {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByPk(bookingId, {
        include: [Seat],
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status === "cancelled") {
        await transaction.rollback();
        return res.status(400).json({ error: "Booking is already cancelled" });
      }

      await Promise.all(
        booking.seats.map((seat) =>
          seat.update({ isBooked: false, bookingId: null }, { transaction })
        )
      );

      await booking.update({ status: "cancelled" }, { transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error("Cancellation failed:", error);
      return res.status(500).json({ error: "Cancellation failed" });
    }
  };

  public getUserBookings = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const bookings = await Booking.findAll({
        where: { userId },
        include: [{ model: Show }, { model: Seat }],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  };
}

const bookingController = new BookingController();
export default bookingController;
