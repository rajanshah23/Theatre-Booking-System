import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Show } from './Show';
import { Seat } from './Seat';
import { Payment } from './Payment';

@Table
export class Booking extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  totalSeats!: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  bookingTime!: Date;
 
@Column({ type: DataType.ENUM('pending', 'booked', 'cancelled'), defaultValue: 'booked' })
status!: 'pending' | 'booked' | 'cancelled';

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Show)
  @Column
  showId!: number;

  @BelongsTo(() => Show)
  show!: Show;

  @HasMany(() => Seat)
  seats!: Seat[];

  @HasOne(() => Payment)
  payment!: Payment;
}
