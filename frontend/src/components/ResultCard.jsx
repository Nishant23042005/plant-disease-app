import React from 'react';

const ResultCard = ({ result }) => {
  const diseaseName = result.disease.replace(/_/g, ' ');
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <div className="result-card">
      <div>
        <strong>🌿 Diagnosis Result</strong>
      </div>
      <div>
        <div className="label">Disease</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>{diseaseName}</div>
      </div>
      <div>
        <div className="label">Confidence</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{confidencePercent}%</div>
      </div>
      <div>
        <div className="label">Description</div>
        <div style={{ lineHeight: 1.5 }}>{result.description}</div>
      </div>
      <div>
        <div className="label">Treatment</div>
        <div style={{ lineHeight: 1.5 }}>{result.treatment}</div>
      </div>
    </div>
  );
};

export default ResultCard;