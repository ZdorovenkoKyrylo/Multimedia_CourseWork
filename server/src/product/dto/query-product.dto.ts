import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsNumber,
  IsEnum,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO для валідації query-параметрів при запиті списку продуктів.
 * Включає фільтрацію, пагінацію та сортування.
 */
export class QueryProductDto {
  // --- Фільтрація ---

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  name?: string; // Для пошуку за назвою

  @IsOptional()
  @IsString()
  description?: string; // Для пошуку за описом

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  /**
   * Фільтр за характеристиками (specs).
   * Очікує об'єкт, переданий через query-параметри, наприклад:
   * ?specs[manufacturer]=Samsung&specs[color]=black
   */
  @IsOptional()
  @IsObject({ message: 'Specs має бути об\'єктом' })
  @Type(() => Object) // Явно вказуємо, що це об'єкт для трансформації
  specs?: Record<string, string>;

  // --- Сортування ---
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'category', 'createdAt', 'stockQuantity'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => (value === 'desc' ? 'desc' : 'asc'))
  sortOrder: 'asc' | 'desc' = 'desc';
}