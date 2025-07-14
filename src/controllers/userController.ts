import { Request, Response } from 'express';
import { Users } from '../entities/userSchema';
import dataSource from '@config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await dataSource.getRepository(Users).find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

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

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const repo = dataSource.getRepository(Users);

  try {
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id); // from /users/:id
  const repo = dataSource.getRepository(Users);

  try {
    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;

  const repo = dataSource.getRepository(Users);

  try {
    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (email) {
      // Check if the new email is already taken by another user
      const emailExists = await repo.findOne({ where: { email } });
      if (emailExists && emailExists.id !== user.id) {
        res.status(409).json({ message: 'Email already in use by another user' });
        return;
      }
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await repo.save(user);

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
