import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
        URL Shortener
      </Link>
      <div>
        {token ? (
          <button onClick={handleLogout} style={{
            background: '#e94560',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ color: '#fff' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

