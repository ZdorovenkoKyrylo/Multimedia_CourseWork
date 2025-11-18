import React from 'react';
import { CartItem } from '../types/CartItem';

interface CartItemCardProps {
  item: CartItem;
  onRemove?: (productId: string) => void;
  onQuantityChange?: (productId: string, newQuantity: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove, onQuantityChange }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <img
        src={item.product.images[0] || 'https://via.placeholder.com/100'}
        alt={item.product.name}
        style={{ width: '100px', height: '80px', objectFit: 'cover' }}
      />

      <div style={{ flexGrow: 1 }}>
        <h4>{item.product.name}</h4>
        <p>Price: ${item.product.price.toFixed(2)}</p>
        <p>
          Quantity: 
          <input
            type="number"
            min={1}
            max={item.product.stockQuantity}
            value={item.quantity}
            onChange={e => onQuantityChange?.(item.product._id, Number(e.target.value))}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </p>
        <p>Subtotal: ${(item.product.price * item.quantity).toFixed(2)}</p>
      </div>

      <button
        onClick={() => onRemove?.(item.product._id)}
        style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItemCard;
