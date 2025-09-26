import React from 'react';
import type { PersonalRecord } from '../types';

interface LatestPRsListProps {
  records: PersonalRecord[];
  onSelectMovement: (movementId: number) => void;
  loading: boolean;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'Invalid Date';
  }
};


const LatestPRsList: React.FC<LatestPRsListProps> = ({ records, onSelectMovement, loading }) => {

  if (loading) {
    return <div className="text-center py-10 text-dark-text-secondary">Loading your records...</div>;
  }

  return (
    <div className="bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Latest Personal Records</h2>
      {records.length === 0 ? (
        <p className="text-center py-8 text-dark-text-secondary">No records found. Add your first PR from the 'Add PR' tab!</p>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <button
              key={record.id}
              onClick={() => onSelectMovement(record.movement_id)}
              className="w-full bg-gray-700 p-4 rounded-lg flex justify-between items-center text-left hover:bg-gray-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <div>
                <h3 className="font-bold text-lg text-white">{record.movements?.name || 'Unknown Movement'}</h3>
                <p className="text-sm text-dark-text-secondary mt-1">
                  {formatDate(record.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-brand-secondary text-lg">{record.value}</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-dark-text-secondary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestPRsList;