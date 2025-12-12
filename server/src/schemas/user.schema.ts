import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from './product.schema';
import { Order } from './order.schema';

// Визначаємо типи ролей
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// Схема для товарів у кошику
@Schema({ _id: false })
export class CartItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product; // Посилання на товар

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number; // Кількість
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true }) // Автоматично додає createdAt та updatedAt
export class User extends Document {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false }) // select: false - не повертати пароль за замовчуванням
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER, // За замовчуванням - відвідувач
  })
  role: UserRole;

  @Prop({ type: [CartItemSchema], default: [] })
  cart: CartItem[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Order' }] })
  orders: Order[];
}

export const UserSchema = SchemaFactory.createForClass(User);