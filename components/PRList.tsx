
import React from 'react';
import { TrashIcon } from './common/Icons';
import type { PersonalRecord } from '../types';

interface PRListProps {
  records: PersonalRecord[];
  onDelete: (id: number) => void;
  loading: boolean;
}

const PRList: React.FC<PRListProps> = ({ records, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="bg-dark-card p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">My Personal Records</h2>
        <div className="text-center py-8 text-dark-text-secondary">Loading records...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">My Personal Records</h2>
      {records.length === 0 ? (
        <p className="text-center py-8 text-dark-text-secondary">No records found. Add your first PR!</p>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-baseline gap-3">
                    <h3 className="font-bold text-lg text-white">{record.movements?.name || 'Unknown Movement'}</h3>
                    <p className="font-semibold text-brand-secondary text-lg">{record.value}</p>
                </div>
                <p className="text-sm text-dark-text-secondary mt-1">{new Date(record.date).toLocaleDateString()}</p>
                {record.notes && <p className="text-sm text-dark-text mt-2 italic">"{record.notes}"</p>}
              </div>
              <button
                onClick={() => onDelete(record.id)}
                className="text-gray-400 hover:text-red-500 transition duration-200 p-2"
                aria-label="Delete record"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PRList;
