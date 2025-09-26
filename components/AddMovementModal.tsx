import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { XMarkIcon } from './common/Icons';

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MOVEMENT_TYPES = ['Weightlifting', 'Gymnastics', 'Cardio', 'Other'];

const AddMovementModal: React.FC<AddMovementModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(MOVEMENT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Movement name is required.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('movements').insert({
      name: name.trim(),
      type,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setName('');
      setType(MOVEMENT_TYPES[0]);
      onSuccess();
    }
    setLoading(false);
  };
  
  const handleClose = () => {
    // Reset form on close
    setName('');
    setType(MOVEMENT_TYPES[0]);
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
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 id="modal-title" className="text-xl font-bold mb-4">Add New Movement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="movement-name" className="block text-sm font-medium text-dark-text-secondary mb-1">Movement Name</label>
            <input
              id="movement-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
              placeholder="e.g., Bench Press"
            />
          </div>

          <div>
            <label htmlFor="new-movement-type" className="block text-sm font-medium text-dark-text-secondary mb-1">Type</label>
            <select
              id="new-movement-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {MOVEMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
              {loading ? 'Saving...' : 'Save Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovementModal;
