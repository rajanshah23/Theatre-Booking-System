import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Booking } from "./Booking";

@Table({
  tableName: "payment",
  modelName: "payment",
  timestamps: true,
})
export class Payment extends Model {
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount!: number;

  @Column({ type: DataType.ENUM("card", "cash", "online"), allowNull: false })
  paymentMethod!: "card" | "cash" | "online";

  @Column({
    type: DataType.ENUM("successful", "failed", "pending"),
    defaultValue: "pending",
  })
  status!: "successful" | "failed" | "pending";

  @ForeignKey(() => Booking)
  @Column
  bookingId!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;
}
