import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity('Category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', enum: ['income','expense'] })
  type!: 'income' | 'expense';

  @Column({ default: false })
  is_default!: boolean;
}
