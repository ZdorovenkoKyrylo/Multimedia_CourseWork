import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsMongoId,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../schemas/order.schema';

/**
 * DTO для валідації query-параметрів при запиті списку замовлень.
 * Включає фільтрацію, пагінацію та сортування.
 */
export class QueryOrderDto {
  // --- Фільтрація ---

  @IsOptional()
  @IsMongoId({ message: 'userId має бути валідним ObjectId' })
  userId?: string; // Для адміна, щоб фільтрувати за юзером

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Невірний статус замовлення' })
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  orderDateFrom?: string; // Фільтр "замовлено з дати"

  @IsOptional()
  @IsDateString()
  orderDateTo?: string; // Фільтр "замовлено по дату"

  // --- Сортування ---

  @IsOptional()
  @IsString()
  @IsIn(['orderDate', 'status', 'createdAt'])
  sortBy: string = 'orderDate'; // За замовчуванням сортуємо за датою замовлення

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc'; // За замовчуванням - найновіші
}