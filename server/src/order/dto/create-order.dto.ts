import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
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
 * DTO для створення нового замовлення.
 * Включає всі поля зі схеми, крім авто-згенерованих.
 */
export class CreateOrderDto {
  @IsMongoId({ message: 'user має бути валідним ObjectId' })
  @IsNotEmpty({ message: 'user не може бути порожнім' })
  user: string;

  @IsArray({ message: 'items має бути масивом' })
  @ArrayMinSize(1, { message: 'Замовлення не може бути порожнім' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString({ message: 'shippingAddress має бути рядком' })
  @IsNotEmpty({ message: 'shippingAddress не може бути порожнім' })
  shippingAddress: string;

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