import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PlusCircleIcon } from './common/Icons';
import type { Movement } from '../types';

interface AddPRFormProps {
  movements: Movement[];
  onAddSuccess: () => void;
  onAddNewMovementClick: () => void;
}

const AddPRForm: React.FC<AddPRFormProps> = ({ movements, onAddSuccess, onAddNewMovementClick }) => {
  const [movementId, setMovementId] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    setMovementId('');
  }, [selectedType]);

  const movementTypes = useMemo(() => ['All', ...Array.from(new Set(movements.map(m => m.type).filter(Boolean)))], [movements]);

  const filteredMovements = useMemo(() => {
    if (selectedType === 'All') {
      return movements;
    }
    return movements.filter(m => m.type === selectedType);
  }, [movements, selectedType]);

  const groupedMovements = useMemo(() => {
    if (selectedType !== 'All') return null;
    return filteredMovements.reduce((acc, movement) => {
      const type = movement.type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(movement);
      return acc;
    }, {} as Record<string, Movement[]>);
  }, [filteredMovements, selectedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementId || !value || !date) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('You must be logged in to add a PR.');
        setLoading(false);
        return;
    }

    const { error: insertError } = await supabase.from('personal_records').insert({
      user_id: user.id,
      movement_id: parseInt(movementId),
      value,
      date,
      notes,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      // Reset form
      setMovementId('');
      setValue('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedType('All');
      onAddSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <PlusCircleIcon className="w-6 h-6 text-brand-primary" />
        Add New PR
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="movement-type" className="block text-sm font-medium text-dark-text-secondary mb-1">Filter by Type</label>
          <select
            id="movement-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {movementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="movement" className="block text-sm font-medium text-dark-text-secondary mb-1">Movement</label>
          <select
            id="movement"
            value={movementId}
            onChange={(e) => setMovementId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            required
          >
            <option value="">Select a movement</option>
            {/* FIX: Replaced Object.entries with Object.keys to prevent a TypeScript type inference issue where the 'moves' array was typed as 'unknown'. */}
            {groupedMovements ? (
              Object.keys(groupedMovements).map(type => (
                <optgroup key={type} label={type}>
                  {groupedMovements[type].map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              ))
            ) : (
              filteredMovements.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))
            )}
          </select>
           <button 
            type="button" 
            onClick={onAddNewMovementClick}
            className="text-sm text-brand-secondary hover:underline mt-2"
          >
            Can't find a movement? Add new.
          </button>
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-dark-text-secondary mb-1">Value (e.g., 100kg, 5:30)</label>
          <input
            id="value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            required
            placeholder="e.g., 100kg or 5:30"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-dark-text-secondary mb-1">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-dark-text-secondary mb-1">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Any details about your lift..."
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-brand-primary hover:bg-red-600 rounded-md text-white font-semibold transition duration-200 disabled:bg-gray-500"
        >
          {loading ? 'Adding...' : 'Add PR'}
        </button>
      </form>
    </div>
  );
};

export default AddPRForm;
