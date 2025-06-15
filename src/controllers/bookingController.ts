import { Request, Response } from "express";
import { Booking } from "../database/models/Booking";
import { Seat } from "../database/models/Seat";
import { Show } from "../database/models/Show";
import { Transaction } from "sequelize";
import axios from "axios";
import { Payment } from "../database/models/Payment";
import { generateTicketPDF } from "../services/ticketGenerator";
import { sendTicketEmail } from "../services/emailService";
import { User } from "../database/models/User";
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
      const {
        seatIds: rawSeatIds,
        paymentMethod,
        showTime,
        seatNumbers,
      } = req.body;
      const seatIds = rawSeatIds.map(Number);
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        return res
          .status(400)
          .json({ error: "seatIds must be a non-empty array" });
      }

      const show = await Show.findByPk(showId, {
        attributes: ["id", "price"],
        transaction,
      });

      if (!show) {
        await transaction.rollback();
        return res.status(404).json({ error: "Show not found" });
      }

      if (!show.price || show.price <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Show has invalid price" });
      }

      const totalAmount = seatIds.length * show.price;

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
        return res
          .status(409)
          .json({ error: "Some seats are already booked or invalid" });
      }

      const booking = await Booking.create(
        {
          userId,
          showId: Number(showId),
          totalSeats: seatIds.length,
          status: "pending",
          showTime,
        },
        { transaction }
      );

      await Promise.all(
        seats.map((seat) =>
          seat.update(
            { isBooked: true, bookingId: booking.id },
            { transaction }
          )
        )
      );

      await transaction.commit();

      if (paymentMethod.toUpperCase() === "KHALTI") {
        try {
          const data = {
            return_url: `https://theatre-booking-system-gamma.vercel.app/payment-success?bookingId=${booking.id}`,
            website_url: "https://theatre-booking-system-gamma.vercel.app/",

            amount: totalAmount * 100,
            purchase_order_id: booking.id,
            purchase_order_name: `booking_${booking.id}`,
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
          });
        } catch (khaltiError) {
          console.error("Khalti payment initiation failed:", khaltiError);

          await booking.update({ status: "failed" });
          await Seat.update(
            { isBooked: false, bookingId: null },
            { where: { id: seatIds } }
          );

          return res.status(500).json({
            error: "Payment initiation failed",
            details:
              (khaltiError as any).response?.data ||
              (khaltiError as Error).message,
          });
        }
      }

      await booking.update({ status: "confirmed" });
      await Payment.create({
        bookingId: booking.id,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        status: "completed",
      });

      return res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Booking failed:", error);
      return res.status(500).json({
        error: "Booking failed",
        details: (error as Error).message,
      });
    }
  };

  public verifyPayment = async (req: Request, res: Response) => {
    const transaction = await Booking.sequelize!.transaction();

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

      const khaltiResponse = response.data;
      console.log("Khalti lookup response:", khaltiResponse);

      if (khaltiResponse.status !== "Completed") {
        await transaction.rollback();
        return res.status(400).json({ message: "Payment not completed" });
      }

      const booking = await Booking.findOne({ where: { pidx }, transaction });

      if (!booking) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "Booking not found for this pidx" });
      }

      await booking.update({ status: "confirmed" }, { transaction });

      const amountRaw = Number(khaltiResponse.total_amount);
      if (isNaN(amountRaw)) {
        throw new Error("Invalid amount received from Khalti");
      }

      await Payment.create(
        {
          bookingId: booking.id,
          amount: amountRaw / 100,
          paymentMethod: "KHALTI",
          transactionId: khaltiResponse.transaction_id,
          status: "successful",
        },
        { transaction }
      );

      await transaction.commit();

      const user = await User.findByPk(booking.userId);
      const show = await Show.findByPk(booking.showId);
      const seats = await Seat.findAll({ where: { bookingId: booking.id } });

      if (user && user.email && show) {
        try {
          const ticketBuffer = await generateTicketPDF(
            booking,
            user,
            show,
            seats
          );

          await sendTicketEmail(user.email, ticketBuffer, booking.id);
        } catch (emailError) {
          console.error("Failed to send ticket email:", emailError);
        }
      }

      return res.status(200).json({
        message: "Payment verified and booking confirmed!",
        booking,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Verification error:", error);
      return res.status(500).json({ message: "Payment verification failed" });
    }
  };

  public downloadTicket = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const booking = await Booking.findByPk(id, {
        include: [
          { model: User, as: "user" },
          { model: Show, as: "show" },
          { model: Seat, as: "seats" },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const ticketBuffer = await generateTicketPDF(
        booking,
        booking.user,
        booking.show,
        booking.seats
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ticket-${booking.id}.pdf`
      );
      res.send(ticketBuffer);
    } catch (error) {
      console.error("Ticket download failed:", error);
      return res.status(500).json({ message: "Failed to generate ticket" });
    }
  };

  public resendTicketEmail = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findByPk(id, {
        include: [
          { model: User, as: "user" },
          { model: Show, as: "show" },
          { model: Seat, as: "seats" },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (!booking.user?.email) {
        return res.status(400).json({ message: "User email not available" });
      }

      // Generate the PDF ticket buffer
      const ticketBuffer = await generateTicketPDF(
        booking,
        booking.user,
        booking.show,
        booking.seats
      );

      // Send the ticket email
      await sendTicketEmail(booking.user.email, ticketBuffer, booking.id);

      return res
        .status(200)
        .json({ message: "Ticket email resent successfully" });
    } catch (error) {
      console.error("Resend email failed:", error);
      return res.status(500).json({ message: "Failed to resend email" });
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
        return res
          .status(400)
          .json({ error: "Only pending bookings can be confirmed" });
      }

      if (!booking.seats || booking.seats.length === 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "No seats associated with booking" });
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
        return res
          .status(409)
          .json({ error: "Some seats have already been booked" });
      }

      await Promise.all(
        seats.map((seat) =>
          seat.update(
            { isBooked: true, bookingId: booking.id },
            { transaction }
          )
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

      if (!booking.seats || booking.seats.length === 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "No seats associated with booking" });
      }

      await Promise.all(
        booking.seats.map((seat) =>
          seat.update({ isBooked: false, bookingId: null }, { transaction })
        )
      );

      await booking.update({ status: "cancelled" }, { transaction });
      await transaction.commit();

      return res
        .status(200)
        .json({ message: "Booking cancelled successfully" });
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
  public getAllBookings = async (req: Request, res: Response) => {
    try {
      const bookings = await Booking.findAll({
        include: [{ model: Show }, { model: Seat }],
      });

      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  };
}

const bookingController = new BookingController();
export default bookingController;
