import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const created = new this.productModel(createProductDto);
    await created.save();
    return this.toResponseDto(created);
  }

  async findAll(query?: QueryProductDto): Promise<ProductResponseDto[]> {
    const filter: any = {};
    if (query?.category) filter.category = query.category;
    if (query?.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query?.description) filter.description = { $regex: query.description, $options: 'i' };
    if (query?.maxPrice !== undefined) filter.price = { $lte: query.maxPrice };
    if (query?.is_available !== undefined) filter.stockQuantity = query.is_available ? { $gt: 0 } : 0;
    if (query?.specs) {
      for (const [key, value] of Object.entries(query.specs)) {
        filter[`specs.${key}`] = value;
      }
    }
    const sort: any = { [query?.sortBy || 'createdAt']: query?.sortOrder === 'asc' ? 1 : -1 };
    const data = await this.productModel.find(filter).sort(sort);
    return data.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Продукт не знайдено');
    return this.toResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true });
    if (!product) throw new NotFoundException('Продукт не знайдено');
    return this.toResponseDto(product);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.productModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Продукт не знайдено');
    return { deleted: true };
  }

  private toResponseDto(product: Product): ProductResponseDto {
    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      images: product.images,
      specs: product.specs,
    };
  }
}
