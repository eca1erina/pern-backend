import { Users } from '../entities/userSchema';
import { Transaction } from '../entities/transactionSchema';
import dataSource from 'config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface UserIdArgs {
  user_id: number;
}

interface GetUserArgs {
  id: number;
}

interface SignupArgs {
  name: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface AddTransactionArgs {
  user_id: number;
  type: 'income' | 'expense';
  category_id: string;
  amount: number;
  description?: string;
  date: string;
  is_recurring?: boolean;
}

const resolvers = {
  Query: {
    getUsers: async () => {
      return await dataSource.getRepository(Users).find();
    },

    getUser: async (_: unknown, args: GetUserArgs) => {
      const { id } = args;
      return await dataSource.getRepository(Users).findOne({ where: { id } });
    },

    getTransactions: async (_: unknown, args: UserIdArgs) => {
      const { user_id } = args;
      return await dataSource.getRepository(Transaction).find({
        where: { user_id },
        order: { date: 'DESC' },
      });
    },

    getIncomeTransactions: async (_: unknown, args: UserIdArgs) => {
      const { user_id } = args;
      return await dataSource.getRepository(Transaction).find({
        where: { user_id, type: 'income' },
        order: { date: 'DESC' },
      });
    },

    getExpenseTransactions: async (_: unknown, args: UserIdArgs) => {
      const { user_id } = args;
      return await dataSource.getRepository(Transaction).find({
        where: { user_id, type: 'expense' },
        order: { date: 'DESC' },
      });
    },
  },

  Mutation: {
    signupUser: async (_: unknown, args: SignupArgs) => {
      const { name, email, password } = args;
      const repo = dataSource.getRepository(Users);

      const existingUser = await repo.findOne({ where: { email } });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = repo.create({ name, email, password: hashedPassword });
      await repo.save(newUser);

      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

      return {
        message: 'User created',
        token,
        user: newUser,
      };
    },

    loginUser: async (_: unknown, args: LoginArgs) => {
      const { email, password } = args;
      const repo = dataSource.getRepository(Users);
      const user = await repo.findOne({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

      return {
        message: 'Login successful',
        token,
        user,
      };
    },

    addTransaction: async (_: unknown, args: AddTransactionArgs) => {
      const {
        user_id,
        type,
        category_id,
        amount,
        description,
        date,
        is_recurring = false,
      } = args;

      const transactionRepo = dataSource.getRepository(Transaction);
      const newTransaction = transactionRepo.create({
        user_id,
        type,
        category_id,
        amount,
        description,
        date,
        is_recurring,
      });

      await transactionRepo.save(newTransaction);
      return newTransaction;
    },
  },
};

export default resolvers;
