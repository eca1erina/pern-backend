import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from '@routes/userRoutes';
import transactionRoutes from '@routes/transactionRoutes';
import myDataSource from '@config/database';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

myDataSource
  .initialize()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('Error during Data Source initialization:', err.message);
    } else {
      console.error('Unknown error during Data Source initialization:', err);
    }
  });

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
