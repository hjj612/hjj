import React from 'react';

interface TechnicalAnalysisProps {
  currency: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ currency }) => {
  return (
    <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
      <h3>Technical Analysis</h3>
      <p>Technical analysis for <b>{currency}</b> will appear here.</p>
    </div>
  );
};

export default TechnicalAnalysis; 