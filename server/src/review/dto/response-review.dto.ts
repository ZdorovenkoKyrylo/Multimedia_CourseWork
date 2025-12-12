/**
 * DTO (вкладений) для інформації про користувача у відгуку.
 * Використовується для ручного маппінгу.
 */
class ReviewUserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
}

/**
 * DTO (вкладений) для інформації про продукт у відгуку.
 * Використовується для ручного маппінгу.
 */
class ReviewProductResponseDto {
  id: string;
  name: string;
}

/**
 * DTO для відповіді клієнту з даними відгуку.
 * Це звичайний клас (POJO) для ручного маппінгу.
 * Очікує, що 'user' та 'product' будуть заповнені (populated)
 * у сервісі перед маппінгом.
 */
export class ReviewResponseDto {
  _id: string; // Mongoose _id, перетворене на рядок

  rating: number;

  comment: string;

  // Вкладені об'єкти для надання контексту
  user: ReviewUserResponseDto;
  product: ReviewProductResponseDto;

}