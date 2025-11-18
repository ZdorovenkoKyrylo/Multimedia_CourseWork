import React from 'react';
import { Order } from '../types/Order';

interface OrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        width: '300px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={() => onClick?.(order)}
    >
      <h3>Order ID: {order._id}</h3>
      <p>Status: {order.status}</p>
      <p>Items: {order.items.length}</p>
      <p>Total: ${total.toFixed(2)}</p>
      <p>Shipping: {order.shippingAddress}</p>
    </div>
  );
};

export default OrderCard;
