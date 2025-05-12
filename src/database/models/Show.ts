import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Booking } from './Booking';
import { Seat } from './Seat';
import { Review } from './Review';

@Table
export class Show extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string;

  @Column({ type: DataType.TIME, allowNull: false })
  time!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  totalSeats!: number;

  @HasMany(() => Booking)
  bookings!: Booking[];

  @HasMany(() => Seat)
  seats!: Seat[];

  @HasMany(() => Review)
  reviews!: Review[];
}
