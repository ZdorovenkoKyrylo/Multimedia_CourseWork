import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { ReviewResponseDto } from './dto/response-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Перевірка наявності унікального відгуку
    const exists = await this.reviewModel.findOne({
      user: createReviewDto.userId,
      product: createReviewDto.productId,
      order: createReviewDto.orderId,
    });
    if (exists) {
      throw new BadRequestException('Відгук для цього товару в цьому замовленні вже існує');
    }
    const created = new this.reviewModel({
      user: createReviewDto.userId,
      product: createReviewDto.productId,
      order: createReviewDto.orderId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
    await created.save();
    await created.populate({ path: 'user', select: 'firstName lastName' });
    await created.populate({ path: 'product', select: 'name' });
    return this.toResponseDto(created);
  }

  async findAll(query?: QueryReviewDto): Promise<ReviewResponseDto[]> {
    const filter: any = {};
    if (query?.userId) filter.user = query.userId;
    if (query?.productId) filter.product = query.productId;
    if (query?.rating) filter.rating = query.rating;
    const sort: any = { [query?.sortBy || 'createdAt']: query?.sortOrder === 'asc' ? 1 : -1 };
    const data = await this.reviewModel.find(filter)
      .populate({ path: 'user', select: 'firstName lastName' })
      .populate({ path: 'product', select: 'name' })
      .sort(sort);
    return data.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findById(id)
      .populate({ path: 'user', select: 'firstName lastName' })
      .populate({ path: 'product', select: 'name' });
    if (!review) throw new NotFoundException('Відгук не знайдено');
    return this.toResponseDto(review);
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, { new: true })
      .populate({ path: 'user', select: 'firstName lastName' })
      .populate({ path: 'product', select: 'name' });
    if (!review) throw new NotFoundException('Відгук не знайдено');
    return this.toResponseDto(review);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.reviewModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Відгук не знайдено');
    return { deleted: true };
  }

  private toResponseDto(review: Review): ReviewResponseDto {
    return {
      _id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      user: review.user && typeof review.user === 'object' ? {
        id: review.user._id?.toString?.() || review.user.id,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
      } : null,
      product: review.product && typeof review.product === 'object' ? {
        id: review.product._id?.toString?.() || review.product.id,
        name: review.product.name,
      } : null,
    }; 
  }
}
