import React from 'react';

const ThreeDModelPlaceholder: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '180px', // під VoiceAssistant (попередньо 150px + 20px відступ)
        right: '20px',
        width: '20%',
        minWidth: '150px',
        maxWidth: '250px',
        height: '200px', // приблизний розмір блоку для 3D моделі
        border: '2px dashed #28a745',
        borderRadius: '8px',
        backgroundColor: '#f0fff0',
        textAlign: 'center',
        zIndex: 1000,
        padding: '10px',
      }}
    >
      <h4>3D Модель з анімаціями</h4>
      <p>Тут буде відображена 3D модель.</p>
    </div>
  );
};

export default ThreeDModelPlaceholder;
