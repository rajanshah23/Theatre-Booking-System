import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Booking } from "./Booking";
import { Seat } from "./Seat";
import { Review } from "./Review";

@Table({
  tableName: "Show",
  modelName: "Show",
  timestamps: true,
})
export class Show extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

@Column(DataType.TEXT)
  description?: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string;

  @Column({ type: DataType.TIME, allowNull: false })
  time!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 300,  
  })
  price!: number;


  @Column({ type: DataType.INTEGER, allowNull: false })
  totalSeats!: number;

  @Column(DataType.STRING) image?: string;

  @HasMany(() => Booking)
  bookings!: Booking[];

  @HasMany(() => Seat)
  seats!: Seat[];

  @HasMany(() => Review)
  reviews!: Review[];
}
