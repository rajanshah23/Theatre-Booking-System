import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Booking } from './Booking';
import { Review } from './Review';

@Table
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.ENUM('customer', 'admin'), defaultValue: 'customer' })
  role!: 'customer' | 'admin';

  @HasMany(() => Booking)
  bookings!: Booking[];

  @HasMany(() => Review)
  reviews!: Review[];
}
