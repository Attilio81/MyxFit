import React from 'react';
import WODList from '../WODList';
import WODRecordsList from '../WODRecordsList';
import type { WODRecord } from '../../types';

interface WODsViewProps {
    wodRecords: WODRecord[];
    onDeleteWODRecord: (id: number) => void;
    onAddScore: (wodName: string) => void;
}

const WODsView: React.FC<WODsViewProps> = ({ wodRecords, onDeleteWODRecord, onAddScore }) => {
  return (
    <div className="space-y-12">
        <WODRecordsList records={wodRecords} onDelete={onDeleteWODRecord} />
        <WODList onAddScore={onAddScore}/>
    </div>
  );
};

export default WODsView;
