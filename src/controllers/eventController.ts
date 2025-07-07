import { Request, Response } from 'express';
import { Users } from '../entities/eventSchema';
import dataSource from '@config/database';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await dataSource.getRepository(Users).find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const repo = dataSource.getRepository(Users);

  const existingUser = await repo.findOne({ where: { email } });
  if (existingUser) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = repo.create({ name, email, password: hashedPassword });
  await repo.save(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(201).json({
    message: 'User created',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
};
