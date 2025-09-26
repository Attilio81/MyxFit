
import React from 'react';
import { FAMOUS_WODS } from '../constants';
import { PlusCircleIcon } from './common/Icons';
import type { WOD } from '../types';

interface WODListProps {
  onAddScore: (wodName: string) => void;
}

const WODCard: React.FC<{ wod: WOD; onAddScore: (wodName: string) => void; }> = ({ wod, onAddScore }) => {
  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold text-white">{wod.name}</h3>
            <span className="text-sm font-semibold bg-brand-primary/20 text-brand-primary py-1 px-2 rounded">{wod.type}</span>
        </div>
        <ul className="mt-4 space-y-2 text-dark-text">
          {wod.description.map((line, index) => (
            <li key={index} className="pl-4 border-l-2 border-dark-border">{line}</li>
          ))}
        </ul>
        {wod.notes && (
          <p className="mt-4 pt-4 border-t border-dark-border text-sm text-dark-text-secondary italic">{wod.notes}</p>
        )}
      </div>
      <div className="mt-6">
        <button 
            onClick={() => onAddScore(wod.name)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-secondary/20 hover:bg-brand-secondary/40 rounded-md text-brand-secondary font-semibold transition duration-200"
        >
            <PlusCircleIcon className="w-5 h-5"/>
            Add Score
        </button>
      </div>
    </div>
  );
};

const WODList: React.FC<WODListProps> = ({ onAddScore }) => {
  return (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Benchmark WODs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAMOUS_WODS.map(wod => (
                <WODCard key={wod.name} wod={wod} onAddScore={onAddScore} />
            ))}
        </div>
    </div>
  );
};

export default WODList;
