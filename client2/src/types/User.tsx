import { CartItem } from './CartItem';
import { Order } from './Order';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  email: string;
  password?: string; // Optional, only used when creating new users
  firstName?: string;
  lastName?: string;
  role: UserRole;
  cart: CartItem[];   // array of CartItem
  orders: Order[];
}
