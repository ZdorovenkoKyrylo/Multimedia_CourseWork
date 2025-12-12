import { UserRole } from '../../schemas/user.schema';

export class UserResponseDto {
  _id: string;

  email: string;

  firstName: string;

  lastName: string;

  role: UserRole;

}