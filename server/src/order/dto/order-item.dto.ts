import { IsMongoId, IsNotEmpty, IsInt, Min } from 'class-validator';

/**
 * Вкладений DTO, що описує OrderItem згідно з вашою схемою.
 * (Лише product ID та quantity).
 *
 * Цей DTO буде перевикористаний в CreateOrderDto та UpdateOrderDto.
 */
export class OrderItemDto {
  @IsMongoId({ message: 'product (в items) має бути валідним ObjectId' })
  @IsNotEmpty()
  product: string;

  @IsInt({ message: 'quantity (в items) має бути цілим числом' })
  @Min(1, { message: 'Мінімальна quantity (в items) - 1' })
  quantity: number;
}