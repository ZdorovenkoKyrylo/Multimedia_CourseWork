import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

/**
 * DTO для оновлення існуючого відгуку.
 * Дозволяє оновити лише рейтинг або коментар.
 * 'user', 'product', 'order' оновити не можна.
 */
export class UpdateReviewDto {
  @IsOptional()
  @IsInt({ message: 'Рейтинг має бути цілим числом' })
  @Min(1, { message: 'Рейтинг не може бути менше 1' })
  @Max(5, { message: 'Рейтинг не може бути більше 5' })
  rating?: number;

  @IsOptional()
  @IsString({ message: 'Коментар має бути рядком' })
  comment?: string;
}