import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

type Role = 'user' | 'admin';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerCode, setManagerCode] = useState('');

  const handleLogin = () => {
    if (role === 'admin' && managerCode !== 'qwerty') {
      return alert('Manager confirmation code is required and must be "qwerty"!');
    }
    if (!email || !password) {
      return alert('Please enter email and password');
    }

    onLogin(role);
    navigate(role === 'user' ? '/' : '/admin');
  };

  const handleCreateAccount = () => {
    if (role === 'admin' && managerCode !== 'qwerty') {
      return alert('Manager confirmation code is required and must be "qwerty"!');
    }
    if (!email || !password) {
      return alert('Please enter email and password');
    }

    alert(`Account created for ${role}`);
    onLogin(role);
    navigate(role === 'user' ? '/' : '/admin');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login / Create Account</h2>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <label className={role === 'user' ? 'active-role' : ''}>
            <input type="radio" checked={role === 'user'} onChange={() => setRole('user')} /> User
          </label>
          <label className={role === 'admin' ? 'active-role' : ''}>
            <input type="radio" checked={role === 'admin'} onChange={() => setRole('admin')} /> Manager
          </label>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
        />

        {/* Manager confirmation code field: required for manager */}
        {role === 'admin' && (
          <input
            type="text"
            placeholder="Manager Confirmation Code"
            value={managerCode}
            onChange={e => setManagerCode(e.target.value)}
            className="login-input"
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button className="login-button login-button-login" onClick={handleLogin}>
            Login
          </button>
          <button className="login-button login-button-create" onClick={handleCreateAccount}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
