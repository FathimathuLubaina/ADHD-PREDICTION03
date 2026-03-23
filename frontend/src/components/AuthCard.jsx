import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LoginCard() {
  const { apiClient, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Make sure the backend is running (npm start in the backend folder).');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="stack">
        <div>
          <div className="pill pill-soft">Secure access</div>
          <h2 className="page-title" style={{ marginTop: 10 }}>
            Welcome back
          </h2>
          <p className="page-subtitle">
            Log in to continue ADHD awareness assessments and view your past results securely.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="stack">
          <div className="stack">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="stack">
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function RegisterCard() {
  const { apiClient, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/register', { name, email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Make sure the backend is running (npm start in the backend folder).');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-muted">
      <div className="stack">
        <div>
          <div className="pill pill-info">New to the platform?</div>
          <h2 className="page-title" style={{ marginTop: 10 }}>
            Create an account
          </h2>
          <p className="page-subtitle">
            Securely store your assessment history and track ADHD-related traits over time.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="stack">
          <div className="stack">
            <label className="field-label">Full Name</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="stack">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="stack">
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-outline btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}

