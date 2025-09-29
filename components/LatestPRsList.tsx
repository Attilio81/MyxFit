import React from 'react';
import type { PersonalRecord } from '../types';
import { MagnifyingGlassIcon } from './common/Icons';

interface LatestPRsListProps {
  records: PersonalRecord[];
  onSelectMovement: (movementId: number) => void;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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


const LatestPRsList: React.FC<LatestPRsListProps> = ({ records, onSelectMovement, loading, searchTerm, onSearchChange }) => {

  if (loading) {
    return <div className="text-center py-10 text-dark-text-secondary">Loading your records...</div>;
  }

  return (
    <div className="bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Latest Personal Records</h2>
      
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-dark-text-secondary" />
        </span>
        <input
          type="text"
          placeholder="Search movements..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-dark-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {records.length === 0 && searchTerm ? (
        <p className="text-center py-8 text-dark-text-secondary">No movements found for "{searchTerm}".</p>
      ) : records.length === 0 && !searchTerm ? (
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