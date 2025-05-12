import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Show } from './Show';

@Table
export class Review extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  rating!: number;

  @Column(DataType.TEXT)
  comment?: string;

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
}
