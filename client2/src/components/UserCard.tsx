import React from 'react';
import { User } from '../types/User';

interface UserCardProps {
  user: User;
  onClick?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        width: '250px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={() => onClick?.(user)}
    >
      <h3>{user.firstName || 'No Name'} {user.lastName || ''}</h3>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Cart items: {user.cart.length}</p>
      <p>Orders: {user.orders.length}</p>
    </div>
  );
};

export default UserCard;
