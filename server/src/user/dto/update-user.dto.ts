import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../schemas/user.schema';

/**
 * DTO для оновлення даних користувача.
 * Всі поля є опціональними.
 * Використовується в PATCH запитах.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Невірний формат email' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Пароль має бути рядком' })
  @MinLength(8, { message: 'Пароль має бути щонайменше 8 символів' })
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Невірна роль. Дозволені: user, admin' })
  role?: UserRole;
}