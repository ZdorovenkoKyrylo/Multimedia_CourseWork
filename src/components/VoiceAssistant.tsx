import React from 'react';

const VoiceAssistant: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '20%',
        minWidth: '150px',
        maxWidth: '250px',
        padding: '10px',
        border: '2px dashed #007bff',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff',
        textAlign: 'center',
        zIndex: 1000,
      }}
    >
      <h4>Голосовий асистент</h4>
      <p>Тут буде область для голосового вводу та виводу.</p>
    </div>
  );
};

export default VoiceAssistant;
