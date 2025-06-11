import {Table,Column,Model,DataType,HasMany,BeforeCreate,  PrimaryKey,
  AutoIncrement,} from 'sequelize-typescript';
import { Booking } from './Booking';
import { Review } from './Review';
 

@Table
export class User extends Model {
   @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  username!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.ENUM('customer', 'admin'), defaultValue: 'customer' })
  role!: 'customer' | 'admin';

 
  @Column({ type: DataType.STRING, allowNull: true })
  otp?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  otpGeneratedTime?: string;

  @HasMany(() => Booking)
  bookings!: Booking[];

  @HasMany(() => Review)
  reviews!: Review[];

 
  }

