import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ required: true, default: 0, min: 0 })
  stockQuantity: number;

  @Prop([String])
  images: string[];

  // Поле для гнучких атрибутів
  // Наприклад: { "виробник": "Samsung", "діагональ": "55", "колір": "чорний" }
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  specs: Record<string, any>;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Review' }] })
  reviews: Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);