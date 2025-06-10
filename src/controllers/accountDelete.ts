import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../database/models/User';  

export const deleteAccount = async (req: Request, res: Response) => {
  try {
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    const userId = req.user.id;  
    const { password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid password' });

    await user.destroy();

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
