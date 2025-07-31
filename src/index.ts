import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from '@routes/userRoutes';
import transactionRoutes from '@routes/transactionRoutes';
import myDataSource from '@config/database';
import bankSimulationRoutes from './routes/bankSimulation';
import currencyRoutes from './routes/currencyRoutes';

import { ApolloServer } from 'apollo-server-express';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import type { Application } from 'express';

const app: Application = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
};

startApolloServer();

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
app.use('/api/bank', bankSimulationRoutes);
app.use('/api', currencyRoutes);