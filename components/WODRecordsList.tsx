import React from 'react';
import { TrashIcon, TrophyIcon } from './common/Icons';
import type { WODRecord } from '../types';

interface WODRecordsListProps {
  records: WODRecord[];
  onDelete: (id: number) => void;
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

const WODRecordsList: React.FC<WODRecordsListProps> = ({ records, onDelete }) => {
  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-brand-secondary" />
            My WOD Scores
        </h2>
      {records.length === 0 ? (
        <p className="text-center py-8 text-dark-text-secondary">No WOD scores recorded yet. Complete a benchmark WOD and add your score!</p>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-baseline gap-3">
                    <h3 className="font-bold text-lg text-white">{record.wod_name}</h3>
                    <p className="font-semibold text-brand-secondary text-lg">{record.score}</p>
                </div>
                <p className="text-sm text-dark-text-secondary mt-1">{formatDate(record.date)}</p>
                {record.notes && <p className="text-sm text-dark-text mt-2 italic">"{record.notes}"</p>}
              </div>
              <button
                onClick={() => onDelete(record.id)}
                className="text-gray-400 hover:text-red-500 transition duration-200 p-2"
                aria-label="Delete WOD score"
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

export default WODRecordsList;