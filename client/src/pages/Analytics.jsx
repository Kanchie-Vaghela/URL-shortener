import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api/axios';

export default function Analytics() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/analytics/${code}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [code]);

  if (!data) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: '0.5rem' }}>Analytics: {data.short_code}</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>{data.original_url}</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#1a1a2e' }}>{data.total_clicks}</h3>
          <p style={{ color: '#666' }}>Total Clicks</p>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1a1a2e' }}>{new Date(data.created_at).toLocaleDateString()}</h3>
          <p style={{ color: '#666' }}>Created</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Clicks by Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.clicks_by_day}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="clicks" stroke="#1a1a2e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Countries</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.top_countries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Referrers</h3>
          {data.top_referrers.length === 0
            ? <p style={{ color: '#999' }}>No referrer data yet</p>
            : data.top_referrers.map(r => (
              <div key={r.referer} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.referer}</span>
                <span style={{ fontWeight: 'bold' }}>{r.clicks}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}