export interface Review {
  userName: string;
  rating: number; // 1 to 5
  comment: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;

  description: string;
  stockQuantity: number;
  images: string[];
  specs: Record<string, string>;

  reviews?: Review[]; // <-- add this
}
