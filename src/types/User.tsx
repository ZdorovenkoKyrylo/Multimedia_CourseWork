import { CartItem } from './CartItem';
import { Order } from './Order';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  cart: CartItem[];   // array of CartItem
  orders: Order[];
}
