import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

export enum OrderStatus {
  PENDING = 'pending', // Очікує підтвердження
  PROCESSING = 'processing', // В обробці
  SHIPPED = 'shipped', // Відправлено
  DELIVERED = 'delivered', // Доставлено
  CANCELLED = 'cancelled', // Скасовано
}

@Schema({ _id: false })
export class OrderItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ required: true, min: 1 })
  quantity: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: String, required: true })
  shippingAddress: string;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus;

  @Prop({ type: Date, required: true, default: () => new Date() })
  orderDate: Date;

  @Prop({ type: Date, required: false })
  deliveryDate?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);