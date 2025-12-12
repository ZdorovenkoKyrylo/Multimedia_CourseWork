import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from '../schemas/order.schema';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderResponseDto } from './dto/response-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly productService: ProductService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Reduce stock for each product
    for (const item of createOrderDto.items) {
      const product = await this.productService.findOne(item.product);
      if (!product) throw new NotFoundException(`Product with id ${item.product} not found`);
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for product: ${product.name}`);
      }
      await this.productService.update(item.product, { stockQuantity: product.stockQuantity - item.quantity });
    }
    const created = new this.orderModel(createOrderDto);
    await created.save();
    await created.populate({ path: 'user', select: 'firstName lastName email' });
    await created.populate({ path: 'items.product', select: 'name' });
    return this.toResponseDto(created);
  }

  async findAll(query?: QueryOrderDto): Promise<OrderResponseDto[]> {
    const filter: any = {};
    if (query?.userId) filter.user = query.userId;
    if (query?.status) filter.status = query.status;
    if (query?.orderDateFrom || query?.orderDateTo) {
      filter.orderDate = {};
      if (query.orderDateFrom) filter.orderDate.$gte = new Date(query.orderDateFrom);
      if (query.orderDateTo) filter.orderDate.$lte = new Date(query.orderDateTo);
    }
    const sort: any = { [query?.sortBy || 'orderDate']: query?.sortOrder === 'asc' ? 1 : -1 };
    const data = await this.orderModel.find(filter)
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name' })
      .sort(sort);
    return data.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderModel.findById(id)
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name' });
    if (!order) throw new NotFoundException('Замовлення не знайдено');
    return this.toResponseDto(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true })
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name' });
    if (!order) throw new NotFoundException('Замовлення не знайдено');
    return this.toResponseDto(order);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.orderModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Замовлення не знайдено');
    return { deleted: true };
  }

  private toResponseDto(order: Order): OrderResponseDto {
    return {
      _id: order._id.toString(),
      user: order.user && typeof order.user === 'object' ? {
        id: order.user._id?.toString?.() || order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
      } : null,
      items: order.items?.map(item => ({
        product: item.product && typeof item.product === 'object' ? {
          id: item.product._id?.toString?.() || item.product.id,
          name: item.product.name,
        } : null,
        name: item.product?.name || '',
        price: (item as any).price ?? 0,
        quantity: item.quantity,
      })) || [],
      shippingAddress: order.shippingAddress,
      status: order.status,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate ?? null,
    };
  }
}
