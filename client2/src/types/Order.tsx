import { Product } from './Product';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Order {
  _id: string;
  userId?: string; // For creating orders
  user?: OrderUser; // Populated user from API response
  items: OrderItem[];
  shippingAddress: string;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
}
