
import React, { useState, useMemo } from 'react';
import type { PersonalRecord } from '../types';

interface PercentageCalculatorProps {
  records: PersonalRecord[];
}

const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({ records }) => {
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [percentage, setPercentage] = useState('80');

  const weightBasedRecords = useMemo(() => {
    return records.filter(r => /\d/.test(r.value) && !/:/.test(r.value)); // Simple filter for records with numbers and no colons
  }, [records]);

  const selectedRecord = useMemo(() => {
    return weightBasedRecords.find(r => r.id.toString() === selectedRecordId);
  }, [selectedRecordId, weightBasedRecords]);

  const calculatedValue = useMemo(() => {
    const numericPercentage = parseFloat(percentage);
    if (!selectedRecord || isNaN(numericPercentage)) {
      return null;
    }
    const baseValue = parseFloat(selectedRecord.value);
    if (isNaN(baseValue)) return null;

    const result = (baseValue * numericPercentage) / 100;
    const unit = selectedRecord.value.replace(/[\d.,\s]/g, ''); // Extract unit like kg, lbs
    
    return `${result.toFixed(2)} ${unit}`;
  }, [selectedRecord, percentage]);

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Percentage Calculator</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="pr-select" className="block text-sm font-medium text-dark-text-secondary mb-1">Select PR</label>
          <select
            id="pr-select"
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Select a weight-based PR</option>
            {weightBasedRecords.map(r => (
              <option key={r.id} value={r.id}>
                {r.movements?.name} - {r.value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="percentage" className="block text-sm font-medium text-dark-text-secondary mb-1">Percentage (%)</label>
          <input
            id="percentage"
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g., 80"
          />
        </div>
        {calculatedValue && selectedRecord && (
          <div className="bg-gray-800 p-4 rounded-md text-center">
            <p className="text-dark-text-secondary">{percentage}% of {selectedRecord.value} is</p>
            <p className="text-2xl font-bold text-brand-secondary mt-1">{calculatedValue}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PercentageCalculator;