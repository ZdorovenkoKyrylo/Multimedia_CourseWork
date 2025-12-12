import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsMongoId,
} from 'class-validator';

/**
 * DTO для створення нового відгуку.
 */
export class CreateReviewDto {
  @IsMongoId({ message: 'userId має бути валідним ObjectId' })
  @IsNotEmpty({ message: 'userId не може бути порожнім' })
  userId: string;

  @IsMongoId({ message: 'productId має бути валідним ObjectId' })
  @IsNotEmpty({ message: 'productId не може бути порожнім' })
  productId: string;

  @IsMongoId({ message: 'orderId має бути валідним ObjectId' })
  @IsNotEmpty({ message: 'orderId не може бути порожнім' })
  orderId: string;

  @IsInt({ message: 'Рейтинг має бути цілим числом' })
  @Min(1, { message: 'Рейтинг не може бути менше 1' })
  @Max(5, { message: 'Рейтинг не може бути більше 5' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Коментар має бути рядком' })
  comment?: string;
}