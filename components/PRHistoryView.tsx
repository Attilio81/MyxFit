import React, { useMemo } from 'react';
import { ArrowLeftIcon, TrashIcon } from './common/Icons';
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

      {history.length === 0 ? (
        <p className="text-center py-8 text-dark-text-secondary">No history found for this movement.</p>
      ) : (
        <div className="space-y-4">
          {history.map(record => (
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