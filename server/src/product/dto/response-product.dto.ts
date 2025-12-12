/**
 * DTO для відповіді клієнту з даними продукту.
 * Це звичайний клас (POJO) для ручного маппінгу.
 */
export class ProductResponseDto {
  _id: string; // Mongoose _id, перетворене на рядок

  name: string;

  description: string;

  price: number;

  category: string;

  stockQuantity: number;

  images: string[];

  specs: Record<string, any>;
}