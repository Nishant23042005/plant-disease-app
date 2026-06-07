import React, { useState } from 'react';

const HistoryTable = ({ history }) => {
  const [search, setSearch] = useState('');

  const filtered = history.filter(item =>
    item.disease.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by disease..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Disease</th>
              <th>Confidence</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td data-label="Image">
                  <img src={item.image_url} alt="leaf" />
                </td>
                <td data-label="Disease">{item.disease.replace(/_/g, ' ')}</td>
                <td data-label="Confidence">{(item.confidence * 100).toFixed(1)}%</td>
                <td data-label="Date">{new Date(item.timestamp).toLocaleDateString()}</td>
                <td data-label="Action">
                  <button
                    onClick={() => alert(`Description: ${item.description}\nTreatment: ${item.treatment}`)}
                    style={{
                      background: 'rgba(34,197,94,0.2)',
                      border: 'none',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '40px',
                      color: '#22c55e',
                      cursor: 'pointer'
                    }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            🌱 No predictions yet. Go to Home to upload an image.
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryTable;