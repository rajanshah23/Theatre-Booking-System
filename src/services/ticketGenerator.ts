import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';  // Add this import
import { Booking } from '../database/models/Booking';
import { User } from '../database/models/User';
import { Show } from '../database/models/Show';
import { Seat } from '../database/models/Seat';

export const generateTicketPDF = async (
  booking: Booking,
  user: User,
  show: Show,
  seats: Seat[]
): Promise<Buffer> => {
  // Generate QR code as data URL   
  const qrData = `BookingID:${booking.id};User:${user.email};Show:${show.title}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Ticket header
    doc
      .fillColor('#333')
      .fontSize(24)
      .text('THEATRE TICKET', { align: 'center' })
      .moveDown(0.5);

    // Divider line 
    doc
      .strokeColor('#e74c3c')
      .lineWidth(2)
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();

    // Booking details
    doc
      .fontSize(14)
      .text(`Booking ID: ${booking.id}`, 50, 120)
      .text(`Date: ${new Date().toLocaleDateString()}`, 50, 150)
      .moveDown(1);

    // Show information
    doc
      .fontSize(18)
      .fillColor('#e74c3c')
      .text(show.title, 50, 200)
      .fontSize(14)
      .fillColor('#333')
      .text(`Date: ${show.date}`, 50, 230)
      .text(`Time: ${show.time}`, 50, 260)
      .text(`Theater: Auditorium 1`, 50, 290)
      .moveDown(1);

    // Seats information
    doc.fontSize(16).text('Seats:', 50, 340).fontSize(14);

    seats.forEach((seat, i) => {
      doc.text(`- ${seat.seatNumber}`, 70, 370 + i * 25);
    });

    // Embed the QR code image in the PDF
    
    const qrImageBuffer = Buffer.from(
      qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''),
      'base64'
    );

    doc.image(qrImageBuffer, 400, 320, { width: 150, height: 150 });

    // Divider line (moved below QR code box)
    doc
      .moveTo(50, 490)
      .lineTo(550, 490)
      .stroke();

    // User information  
    doc
      .fontSize(14)
      .text(`Name: ${user.id}`, 50, 510)
      .text(`Email: ${user.email}`, 50, 540);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#777')
      .text(
        'Thank you for your booking! Present this ticket at the entrance.',
        50,
        600,
        { align: 'center', width: 500 }
      );

    doc.end();
  });
};
