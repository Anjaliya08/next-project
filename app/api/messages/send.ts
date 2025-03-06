import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/dbConnect';
import Message from'../../../models/Messages';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  await dbConnect();

  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ senderId, receiverId, content });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
