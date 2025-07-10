import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Users } from './eventSchema';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Users, (user) => user.transactions)
  user!: Users;

  @Column({ type: 'varchar' })
  type!: 'income' | 'expense';

  @Column({
  type: 'varchar',
  nullable: false,
})
category!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ default: false })
  is_recurring!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
