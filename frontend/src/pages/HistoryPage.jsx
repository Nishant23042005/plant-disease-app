import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import HistoryTable from '../components/HistoryTable';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        setHistory(res.data);
      } catch (err) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem' }}></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message" style={{ textAlign: 'center', margin: '2rem' }}>{error}</div>;
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff, #22c55e)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        📜 Prediction History
      </h1>
      <HistoryTable history={history} />
    </div>
  );
};

export default HistoryPage;