// controllers/paymentController.ts
import { Request, Response } from "express";
import axios from "axios";
import { Payment } from "../database/models/Payment";
import { Booking } from "../database/models/Booking";

export const verifyKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return res.status(400).json({ message: "Missing pidx" });

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
    const payment = await Payment.findOne({ where: { pidx } });
    
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (khaltiResponse.status === "Completed") {
      payment.status = "successful";
      await payment.save();

      await Booking.update(
        { status: "confirmed" }, 
        { where: { id: payment.bookingId } }
      );

      return res.status(200).json({ 
        message: "Payment successful", 
        data: khaltiResponse 
      });
    } 
    
    payment.status = "failed";
    await payment.save();
    return res.status(400).json({ 
      message: "Payment not completed", 
      data: khaltiResponse 
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to verify payment",
      error: error?.response?.data || error.message,
    });
  }
};