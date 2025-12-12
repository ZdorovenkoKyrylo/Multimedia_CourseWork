import { OrderStatus } from '../../schemas/order.schema';

/**
 * DTO (вкладений) для інформації про користувача в замовленні.
 * Використовується для ручного маппінгу.
 */
class OrderUserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * DTO (вкладений) для інформації про продукт в елементі замовлення.
 * Використовується для ручного маппінгу.
 */
class OrderItemProductResponseDto {
  id: string;
  name: string; // Оригінальна назва продукту
}

/**
 * DTO (вкладений) для одного елемента в замовленні.
 */
class OrderItemResponseDto {
  product: OrderItemProductResponseDto; // Посилання на продукт
  name: string; // Назва на момент покупки
  price: number; // Ціна на момент покупки
  quantity: number;
}

/**
 * DTO для відповіді клієнту з даними замовлення.
 * Це звичайний клас (POJO) для ручного маппінгу.
 * Очікує, що 'user' та 'items.product' будуть заповнені (populated)
 * у сервісі перед маппінгом.
 */
export class OrderResponseDto {
  _id: string; // Mongoose _id, перетворене на рядок

  user: OrderUserResponseDto; // Інформація про користувача

  items: OrderItemResponseDto[]; // Список замовлених товарів

  shippingAddress: string;

  status: OrderStatus;

  orderDate: Date;

  deliveryDate: Date | null; // Може бути null
}