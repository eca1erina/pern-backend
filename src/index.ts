import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import bankSimulationRoutes from './routes/bankSimulation';
import currencyRoutes from './routes/currencyRoutes';
import aiRoutes from './routes/aiRoutes';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// GraphQL
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
};
startApolloServer();

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/api/bank', bankSimulationRoutes);
app.use('/api', currencyRoutes);
app.use('/api/analyze-transactions', aiRoutes);

import myDataSource from './config/database';
myDataSource
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Data Source init error:', err);
  });

export default app; 
