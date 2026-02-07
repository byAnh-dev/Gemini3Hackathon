
import React from 'react';

const RiskBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColors = () => {
    if (score >= 8) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (score >= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getLabel = () => {
    if (score >= 8) return 'Critical';
    if (score >= 5) return 'High Workload';
    return 'Stable';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getColors()}`}>
      {getLabel()} (Risk: {score})
    </span>
  );
};

export default RiskBadge;
