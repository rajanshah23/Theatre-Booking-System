import { Table, Column, Model, DataType, HasMany, BeforeCreate } from 'sequelize-typescript';
import { Booking } from './Booking';
import { Review } from './Review';
import bcrypt from 'bcrypt';

@Table
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: true })
  username!: string;

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

  @BeforeCreate
  static async hashPassword(user: User) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
}
