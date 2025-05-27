import { Request, Response } from "express";
import axios from "axios";
import { Payment } from "../database/models/Payment";
import { Booking } from "../database/models/Booking";

const KHALTI_SECRET_KEY = "Key YOUR_SECRET_KEY_HERE"; // 🔒 Replace with your actual Khalti Secret Key

// Initiate Khalti Payment
export const initiateKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { totalAmount, bookingId, paymentMethod } = req.body;

    if (!totalAmount || !bookingId || paymentMethod !== "online") {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Prepare data for Khalti e-payment
    const data = {
      return_url: "http://localhost:5173/",
      website_url: "http://localhost:5173/",
      amount: totalAmount * 100, // Convert to paisa
      purchase_order_id: bookingId.toString(),
      purchase_order_name: "booking_" + bookingId,
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      data,
      {
        headers: {
          Authorization:  "Key a2cede7e801a4fe7a057c80ba2f526e5",
        },
      }
    );

    const khaltiResponse = response.data;

    // Store payment record as pending
    const payment = await Payment.create({
      amount: totalAmount,
      paymentMethod: "online",
      status: "pending",
      bookingId: booking.id,
      pidx: khaltiResponse.pidx,
    });

    res.status(200).json({
      message: "Payment initiated successfully",
      url: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
      paymentId: payment.id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to initiate payment",
      error: error?.response?.data || error.message,
    });
  }
};

// Verify Khalti Payment with pidx
export const verifyKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "Missing pidx" });
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: KHALTI_SECRET_KEY,
        },
      }
    );

    const khaltiResponse = response.data;

    const payment = await Payment.findOne({ where: { pidx } });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (khaltiResponse.status === "Completed") {
      payment.status = "successful";
      await payment.save();

      // Optionally mark booking as confirmed
      await Booking.update({ status: "confirmed" }, { where: { id: payment.bookingId } });

      return res.status(200).json({ message: "Payment successful", data: khaltiResponse });
    } else {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment not completed", data: khaltiResponse });
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to verify payment",
      error: error?.response?.data || error.message,
    });
  }
};
