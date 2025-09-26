import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { XMarkIcon } from './common/Icons';

interface AddWODScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wodName: string;
}

const AddWODScoreModal: React.FC<AddWODScoreModalProps> = ({ isOpen, onClose, onSuccess, wodName }) => {
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score.trim() || !date) {
      setError('Score and Date are required.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('You must be logged in to add a score.');
        setLoading(false);
        return;
    }

    const { error: insertError } = await supabase.from('wod_records').insert({
      user_id: user.id,
      wod_name: wodName,
      score,
      date,
      notes,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };
  
  const handleClose = () => {
    setScore('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 id="modal-title" className="text-xl font-bold mb-1">Add Score for <span className="text-brand-primary">{wodName}</span></h2>
        <p className="text-dark-text-secondary mb-4 text-sm">Log your result for this benchmark WOD.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="wod-score" className="block text-sm font-medium text-dark-text-secondary mb-1">Score (Time, Reps, etc.)</label>
            <input
              id="wod-score"
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
              placeholder="e.g., 5:32 or 15 rounds + 5 reps"
            />
          </div>
          
          <div>
            <label htmlFor="wod-date" className="block text-sm font-medium text-dark-text-secondary mb-1">Date</label>
            <input
              id="wod-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="wod-notes" className="block text-sm font-medium text-dark-text-secondary mb-1">Notes (e.g., Rx, Scaled)</label>
            <textarea
              id="wod-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., Rx, Scaled to 75lb, broke pull-ups 5x5"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
             <button
              type="button"
              onClick={handleClose}
              className="py-2 px-4 bg-dark-border hover:bg-gray-600 rounded-md text-white font-semibold transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-brand-primary hover:bg-red-600 rounded-md text-white font-semibold transition duration-200 disabled:bg-gray-500"
            >
              {loading ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWODScoreModal;
