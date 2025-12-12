import React from 'react';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        width: '100%',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
      onClick={() => onClick?.(product)}
    >
      <img
        src={product.images?.[0] || 'https://via.placeholder.com/200x150'}
        alt={product.name}
        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
      />

      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <p>${product.price.toFixed(2)}</p>
      <p>Stock: {product.stockQuantity}</p>
    </div>
  );
};

export default ProductCard;
