import { Request, Response } from 'express';
import { Transaction } from '../entities/transactionSchema';
import dataSource from '@config/database';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    res.status(400).json({ message: 'Missing or invalid user_id parameter' });
    return;
  }

  try {
    const transactions = await dataSource.getRepository(Transaction).find({
      where: { user_id: userId },
      order: { date: 'DESC' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

export const getIncomeTransactions = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    res.status(400).json({ message: 'Missing or invalid user_id parameter' });
    return;
  }

  try {
    const transactions = await dataSource.getRepository(Transaction).find({
      where: {
        user_id: userId,
        type: 'income',
      },
      order: { date: 'DESC' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching income transactions:', error);
    res.status(500).json({ message: 'Failed to fetch income transactions' });
  }
};

export const getExpensesTransactions = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    res.status(400).json({ message: 'Missing or invalid user_id parameter' });
    return;
  }

  try {
    const transactions = await dataSource.getRepository(Transaction).find({
      where: {
        user_id: userId,
        type: 'expense',
      },
      order: { date: 'DESC' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    res.status(500).json({ message: 'Failed to fetch expense transactions' });
  }
};
