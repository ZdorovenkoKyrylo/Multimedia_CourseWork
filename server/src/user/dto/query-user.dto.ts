import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '../../schemas/user.schema';

/**
 * DTO для валідації параметрів запиту (query params)
 * при отриманні списку користувачів.
 * Включає фільтрацію, пагінацію та сортування.
 */
export class QueryUserDto {
  // --- Фільтрація ---
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // --- Сортування ---
  @IsOptional()
  @IsString()
  @IsIn(['email', 'firstName', 'lastName', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => (value === 'desc' ? 'desc' : 'asc'))
  sortOrder: 'asc' | 'desc' = 'desc';
}