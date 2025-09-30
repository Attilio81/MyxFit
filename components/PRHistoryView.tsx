import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, TrashIcon, MagnifyingGlassIcon } from './common/Icons';
import type { PersonalRecord, Movement } from '../types';

interface PRHistoryViewProps {
  movementId: number;
  allRecords: PersonalRecord[];
  movements: Movement[];
  onDelete: (id: number) => void;
  onBack: () => void;
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

const PRHistoryView: React.FC<PRHistoryViewProps> = ({ movementId, allRecords, movements, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { movement, history } = useMemo(() => {
    const movement = movements.find(m => m.id === movementId);
    const history = allRecords
      .filter(r => r.movement_id === movementId)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime())) return 1; // push invalid dates to the end
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
    return { movement, history };
  }, [movementId, allRecords, movements]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) {
      return history;
    }
    return history.filter(record => {
      const term = searchTerm.toLowerCase();
      const valueMatch = record.value.toLowerCase().includes(term);
      const notesMatch = record.notes?.toLowerCase().includes(term) || false;
      return valueMatch || notesMatch;
    });
  }, [history, searchTerm]);
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
        onDelete(id);
    }
  }

  if (!movement) {
    return (
      <div className="text-center p-8">
        <p>Movement not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-secondary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">{movement.name} - History</h2>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-dark-text-secondary" />
        </span>
        <input
          type="text"
          placeholder="Search in history (e.g., by value or notes)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-dark-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label={`Search history for ${movement.name}`}
        />
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-center py-8 text-dark-text-secondary">
          {searchTerm 
            ? `No records found matching "${searchTerm}".`
            : 'No history found for this movement.'
          }
        </p>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(record => (
            <div key={record.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="font-semibold text-brand-secondary text-xl">{record.value}</p>
                  <p className="text-sm text-dark-text-secondary">
                    {formatDate(record.date)}
                  </p>
                </div>
                {record.notes && <p className="text-sm text-dark-text mt-2 italic">"{record.notes}"</p>}
              </div>
              <button
                onClick={() => handleDelete(record.id)}
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

export default PRHistoryView;
