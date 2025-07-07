mport { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.HOST,
  port: Number(process.env.PORT) || 5432,
  username: 'postgres',
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  entities: ['src/entities/*.ts'],
};

const dataSource = new DataSource(config);

export default dataSource;
