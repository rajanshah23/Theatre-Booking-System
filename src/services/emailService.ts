import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send ticket email with PDF attachment
export const sendTicketEmail = async (
  email: string,
  ticketBuffer: Buffer,
  bookingId: number
) => {
  const mailOptions = {
    from: `Theatre Booking <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Ticket for Booking #${bookingId}`,
    text: 'Thank you for your booking! Your ticket is attached.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Your Booking is Confirmed!</h2>
        <p>Thank you for booking with us. Your ticket is attached to this email.</p>
        <p>Booking ID: <strong>#${bookingId}</strong></p>
        <p>You can also download your ticket anytime from your account.</p>
        <p style="margin-top: 30px; color: #777; font-size: 14px;">
          If you have any questions, contact us at example@theatre.com
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `ticket-${bookingId}.pdf`,
        content: ticketBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};
