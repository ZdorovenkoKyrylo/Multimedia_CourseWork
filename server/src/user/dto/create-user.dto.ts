import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../schemas/user.schema';

/**
 * DTO для створення нового користувача.
 * Використовується в body запиту при реєстрації
 * або створенні користувача адміністратором.
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  @IsNotEmpty({ message: 'Email не може бути порожнім' })
  @Transform(({ value }) => value.toLowerCase().trim()) // Нормалізація email
  email: string;

  @IsString({ message: 'Пароль має бути рядком' })
  @IsNotEmpty({ message: 'Пароль не може бути порожнім' })
  @MinLength(8, { message: 'Пароль має бути щонайменше 8 символів' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  /**
   * Роль може бути опційно вказана (наприклад, адміністратором).
   * Якщо не вказана, схема застосує default 'user'.
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'Невірна роль. Дозволені: user, admin' })
  role?: UserRole;
}