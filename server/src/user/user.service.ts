import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<{ user: UserResponseDto; access_token: string }> {
    const user = await this.userModel.findOne({ email: loginUserDto.email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokenObj = await this.authService.generateToken(user);
    return {
      user: this.toResponseDto(user),
      access_token: tokenObj.access_token,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userModel.findOne({ email: createUserDto.email });
    
    if (exists) {
      throw new BadRequestException('Користувач з таким email вже існує');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const created = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    await created.save();
    return this.toResponseDto(created);
  }

  async findAll(query: QueryUserDto): Promise<UserResponseDto[]> {
    const filter: any = {};
    if (query.email) filter.email = query.email;
    if (query.firstName) filter.firstName = { $regex: query.firstName, $options: 'i' };
    if (query.lastName) filter.lastName = { $regex: query.lastName, $options: 'i' };
    if (query.role) filter.role = query.role;

    const sort: any = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };

    const data = await this.userModel.find(filter).sort(sort);
    return data.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Користувача не знайдено');
    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Hash password if it's being updated
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!user) throw new NotFoundException('Користувача не знайдено');
    return this.toResponseDto(user);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.userModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Користувача не знайдено');
    return { deleted: true };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
