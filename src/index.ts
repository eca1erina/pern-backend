import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; 
import eventRoutes from '@routes/eventRoutes';
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
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

app.use('/users', eventRoutes);
