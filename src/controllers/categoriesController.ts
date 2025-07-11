// In categoriesController.ts
import { Request, Response } from 'express';
import dataSource from '@config/database';
import { Category } from '../entities/categorySchema';

export const getExpenseCategories = async (_: Request, res: Response) => {
  const cats = await dataSource.getRepository(Category).find({
    where: { type: 'expense' },
    order: { is_default: 'DESC', name: 'ASC' },
  });
  res.json(cats);
};
