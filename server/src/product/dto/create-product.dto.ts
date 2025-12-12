import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsUrl,
  IsObject,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для створення нового продукту.
 * Використовується адміністраторами.
 */
export class CreateProductDto {
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва не може бути порожньою' })
  name: string;

  @IsString({ message: 'Опис має бути рядком' })
  @IsNotEmpty({ message: 'Опис не може бути порожнім' })
  description: string;

  @IsNumber({}, { message: 'Ціна має бути числом' })
  @Min(0, { message: 'Ціна не може бути негативною' })
  price: number;

  @IsString({ message: 'Категорія має бути рядком' })
  @IsNotEmpty({ message: 'Категорія не може бути порожньою' })
  category: string;

  @IsOptional()
  @IsInt({ message: 'Кількість на складі має бути цілим числом' })
  @Min(0, { message: 'Кількість на складі не може бути негативною' })
  @Type(() => Number)
  stockQuantity?: number; // Схема має default: 0

  @IsOptional()
  @IsArray({ message: 'Зображення мають бути масивом' })
  @IsUrl({}, { each: true, message: 'Кожне зображення має бути валідним URL' })
  images?: string[];

  @IsOptional()
  @IsObject({ message: 'Характеристики (specs) мають бути об\'єктом' })
  specs?: Record<string, any>;
}