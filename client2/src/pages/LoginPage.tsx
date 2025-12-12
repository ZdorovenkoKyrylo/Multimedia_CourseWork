import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return alert('Please enter email and password');
    }

    try {
      setIsLoading(true);
      const response = await userAPI.login(email, password);
      const user = response.user;
      const token = response.access_token;
      // If user is an admin in the database, they must provide the manager code
      if (user.role === 'admin' && managerCode !== 'qwerty') {
        alert('Manager confirmation code is required for admin access!');
        setIsLoading(false);
        return;
      }
      login(user, token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !password) {
      return alert('Please enter email and password');
    }

    const role = managerCode === 'qwerty' ? 'admin' : 'user';

    try {
      setIsLoading(true);
      const response = await userAPI.create({
        email,
        password,
        role,
        firstName: '',
        lastName: '',
      });
      const user = response.user || response; // fallback for old API
      alert('Account created successfully!');
      // After creating account, log in to get token
      const loginResponse = await userAPI.login(email, password);
      login(loginResponse.user, loginResponse.access_token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      console.error('Create account error:', err);
      alert(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login / Create Account</h2>

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

        {/* Manager confirmation code field: optional for admin access */}
        <input
          type="text"
          placeholder="Manager Code (optional for admin)"
          value={managerCode}
          onChange={e => setManagerCode(e.target.value)}
          className="login-input"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button 
            className="login-button login-button-login" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          <button 
            className="login-button login-button-create" 
            onClick={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
