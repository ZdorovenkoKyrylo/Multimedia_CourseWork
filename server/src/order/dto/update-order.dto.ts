import {
  IsString,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../schemas/order.schema';
import { OrderItemDto } from './order-item.dto';

/**
 * DTO для оновлення існуючого замовлення.
 * Включає всі поля зі схеми (крім авто-згенерованих) як опціональні.
 */
export class UpdateOrderDto {
  @IsOptional()
  @IsMongoId({ message: 'user має бути валідним ObjectId' })
  user?: string;

  @IsOptional()
  @IsArray({ message: 'items має бути масивом' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsString({ message: 'shippingAddress має бути рядком' })
  shippingAddress?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Невірний статус замовлення' })
  status?: OrderStatus;

  @IsOptional()
  @IsDateString({}, { message: 'orderDate має бути валідною датою' })
  orderDate?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'deliveryDate має бути валідною датою' })
  deliveryDate?: Date;
}