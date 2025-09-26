import React from 'react';
import PercentageCalculator from '../PercentageCalculator';
import type { PersonalRecord } from '../../types';

interface CalculatorViewProps {
  records: PersonalRecord[];
}

const CalculatorView: React.FC<CalculatorViewProps> = ({ records }) => {
  return (
     <div className="max-w-lg mx-auto">
        <PercentageCalculator records={records} />
    </div>
  );
};

export default CalculatorView;
