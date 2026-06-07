import React, { useState } from 'react';
import { login, register } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        onLogin(res.data.access_token, res.data.user);
      } else {
        await register(email, name, password);
        const res = await login(email, password);
        onLogin(res.data.access_token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 25px 45px rgba(0,0,0,0.3)',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{
              textAlign: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#f8fafc',
            }}>
              {isLogin ? 'Login' : 'Create account'}
            </h2>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    color: '#f8fafc',
                  }}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: '#f8fafc',
                }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: '#f8fafc',
                }}
                required
              />
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading && <span className="spinner" style={{ marginRight: '0.5rem' }}></span>}
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
            <div
              onClick={() => setIsLogin(!isLogin)}
              style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                color: '#22c55e',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {isLogin ? 'Create account' : 'Back to Login'}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;