import { Request, Response } from 'express';
import { Booking } from '../database/models/Booking';
import { Seat } from '../database/models/Seat';
import { Show } from '../database/models/Show';
import { Transaction } from 'sequelize';

class BookingController {
 
  async createBooking(req: Request, res: Response) {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { showId } = req.params;
      const { seatIds } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'seatIds must be a non-empty array' });
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
        return res.status(409).json({ error: 'Some seats are already booked or invalid' });
      }
 
      const booking = await Booking.create({
        userId,
        showId: Number(showId),
        totalSeats: seatIds.length,
        status: 'pending',
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ message: 'Booking created as pending', booking });

    } catch (error) {
      await transaction.rollback();
      console.error('Booking failed:', error);
      return res.status(500).json({ error: 'Booking failed', details: (error as Error).message });
    }
  }

  async confirmBooking(req: Request, res: Response) {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByPk(bookingId, {
        include: [Seat],
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.status !== 'pending') {
        await transaction.rollback();
        return res.status(400).json({ error: 'Only pending bookings can be confirmed' });
      }

   
      const seats = await Seat.findAll({
        where: {
          id: booking.seats.map(seat => seat.id),
          isBooked: false,
        },
        transaction,
      });

      if (seats.length !== booking.seats.length) {
        await transaction.rollback();
        return res.status(409).json({ error: 'Some seats have already been booked by others' });
      }

    
      await Promise.all(seats.map(seat =>
        seat.update({ isBooked: true, bookingId: booking.id }, { transaction })
      ));

      
      await booking.update({ status: 'booked' }, { transaction });

      await transaction.commit();

      return res.status(200).json({ message: 'Booking confirmed', booking });

    } catch (error) {
      await transaction.rollback();
      console.error('Confirmation failed:', error);
      return res.status(500).json({ error: 'Confirmation failed' });
    }
  }

  
  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const bookings = await Booking.findAll({
        where: { userId },
        include: [
          { model: Show },
          { model: Seat },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json(bookings);

    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  
  async cancelBooking(req: Request, res: Response) {
    const transaction: Transaction = await Booking.sequelize!.transaction();
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByPk(bookingId, {
        include: [Seat],
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.status === 'cancelled') {
        await transaction.rollback();
        return res.status(400).json({ error: 'Booking is already cancelled' });
      }

     
      await Promise.all(
        booking.seats.map(seat =>
          seat.update({ isBooked: false, bookingId: null }, { transaction })
        )
      );

      
      await booking.update({ status: 'cancelled' }, { transaction });

      await transaction.commit();

      return res.status(200).json({ message: 'Booking cancelled successfully' });

    } catch (error) {
      await transaction.rollback();
      console.error('Cancellation failed:', error);
      return res.status(500).json({ error: 'Cancellation failed' });
    }
  }

  
  getAvailableSeats = async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.showId);
      if (isNaN(showId)) {
        return res.status(400).json({ error: "Invalid showId" });
      }
      console.log("Fetching seats for showId:", showId);

      const seats = await Seat.findAll({
        where: { showId, isBooked: false },
        order: [["seatNumber", "ASC"]],
      });

      console.log("Seats found:", seats.length);

      res.status(200).json(seats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch seats" });
    }
  };
}

export default new BookingController();
