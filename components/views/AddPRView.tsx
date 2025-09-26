import React from 'react';
import AddPRForm from '../AddPRForm';
import type { Movement } from '../../types';

interface AddPRViewProps {
  movements: Movement[];
  onAddSuccess: () => void;
  onAddNewMovementClick: () => void;
}

const AddPRView: React.FC<AddPRViewProps> = (props) => {
  return (
    <div className="max-w-lg mx-auto">
        <AddPRForm {...props} />
    </div>
  );
};

export default AddPRView;
