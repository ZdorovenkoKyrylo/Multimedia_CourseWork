import { Product } from './Product';

export interface CartItem {
  product: Product; // reference the full product object
  quantity: number;
}
