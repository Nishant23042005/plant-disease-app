import React, { useState } from 'react';
import Hero from '../components/Hero';
import UploadSection from '../components/UploadSection';
import ResultCard from '../components/ResultCard';

const HomePage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container">
      <Hero />
      <UploadSection setResult={setResult} setLoading={setLoading} showToast={showToast} />
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
          <p style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>Analyzing image...</p>
        </div>
      )}
      {result && <ResultCard result={result} />}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default HomePage;