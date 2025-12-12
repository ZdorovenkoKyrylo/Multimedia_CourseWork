import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для валідації query-параметрів при запиті списку відгуків.
 * Включає фільтрацію, пагінацію та сортування.
 */
export class QueryReviewDto {
  // --- Фільтрація ---

  @IsOptional()
  @IsMongoId({ message: 'userId має бути валідним ObjectId' })
  userId?: string;

  @IsOptional()
  @IsMongoId({ message: 'productId має бути валідним ObjectId' })
  productId?: string;

  @IsOptional()
  @IsInt({ message: 'Рейтинг має бути цілим числом' })
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  // --- Сортування ---

  @IsOptional()
  @IsString()
  @IsIn(['rating', 'createdAt'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}