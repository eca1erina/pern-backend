import { Request, Response } from 'express';
import { Transaction } from '../entities/transactionSchema';
import dataSource from '../config/database';

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
      where: { user_id: userId, type: 'income' },
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
      where: { user_id: userId, type: 'expense' },
      order: { date: 'DESC' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    res.status(500).json({ message: 'Failed to fetch expense transactions' });
  }
};

export const addTransaction = async (req: Request, res: Response): Promise<void> => {
  const {
    user_id,
    type,
    category_id,
    amount,
    description,
    date,
    is_recurring,
  } = req.body;

  if (!user_id || !type || !category_id || !amount || !date) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const transactionRepo = dataSource.getRepository(Transaction);
    const newTransaction = transactionRepo.create({
      user_id,
      type,
      category_id,
      amount,
      description,
      date,
      is_recurring: is_recurring ?? false,
    });

    await transactionRepo.save(newTransaction);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Failed to add transaction' });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'Missing transaction ID' });
    return;
  }

  try {
    const transactionRepo = dataSource.getRepository(Transaction);
    const transaction = await transactionRepo.findOne({ where: { id } });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    await transactionRepo.remove(transaction);
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};
