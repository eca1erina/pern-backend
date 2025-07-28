import axios from 'axios';
import { Request, Response } from 'express';

const MOCK_BANK_API = 'https://687bb1fab4bc7cfbda86d9e3.mockapi.io/bank/bankTransactions';

export const fetchBankTransactions = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.user_id;

  if (!userId) {
    res.status(400).json({ message: 'Missing user_id' });
    return;
  }

  try {
    const response = await axios.get(`${MOCK_BANK_API}?user_id=${userId}`);
    const bankTransactions = response.data;

    res.status(200).json({
      source: 'mock-bank-api',
      transactions: bankTransactions,
    });
  } catch (error) {
    console.error('Failed to fetch bank transactions:', error);
    res.status(500).json({ message: 'Error fetching from mock bank' });
  }
};
