import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

type Role = 'user' | 'admin' | null;

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(null);

  const handleLogin = (userRole: Role) => setRole(userRole);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/" element={role === 'user' ? <Home /> : <Navigate to="/login" />} />
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
