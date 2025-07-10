import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: number;

  @Column({
    type: 'varchar',
    enum: ['income', 'expense'],
  })
  type!: 'income' | 'expense';

  @Column()
  category_id!: string;

  @Column('numeric', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'boolean', default: false })
  is_recurring!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
