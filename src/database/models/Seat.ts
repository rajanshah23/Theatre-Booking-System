import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Booking } from './Booking';
import { Show } from './Show';

@Table
export class Seat extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  seatNumber!: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isBooked!: boolean;

  @ForeignKey(() => Booking)
  @Column
  bookingId?: number;

  @BelongsTo(() => Booking)
  booking?: Booking;

  @ForeignKey(() => Show)
  @Column
  showId!: number;

  @BelongsTo(() => Show)
  show!: Show;
}
