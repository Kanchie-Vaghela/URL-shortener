import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '0.75rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}