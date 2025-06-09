import express, { Request, Response } from 'express';
import { sendContactFormEmail } from '../services/emailService';
import { asyncHandler } from '../middleware/authMiddleware';

const router = express.Router();

interface ContactFormBody {
  name: string;
  email: string;
  message: string;
}

router.post('/contact', asyncHandler(async (req: Request<{}, {}, ContactFormBody>, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  await sendContactFormEmail(name, email, message);
  res.status(200).json({ message: 'Contact form submitted successfully.' });
}));

export default router;
