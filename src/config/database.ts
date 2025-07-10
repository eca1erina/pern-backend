import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Users } from '../entities/eventSchema';
import { Transaction } from '../entities/Transaction'; 

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.HOST,
  port: Number(process.env.PORT) || 5432,
  username: 'postgres',
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  entities: [Users, Transaction],
};

const dataSource = new DataSource(config);

export default dataSource;
