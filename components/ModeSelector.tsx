import React from 'react';
import { ReviewMode } from '../types/flashcard';

interface ModeSelectorProps {
    selectedMode: ReviewMode;
    onModeChange: (mode: ReviewMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = event.target.value as ReviewMode;
        onModeChange(newMode);
    };

    return (
        <div className="my-4 flex justify-center items-center flex-wrap gap-2.5 w-full">
            <label htmlFor="mode" className="font-medium mr-1">Study Mode:</label>
            <select
                id="mode"
                value={selectedMode}
                onChange={handleModeChange}
                className="px-4 py-2 rounded border border-gray-300 text-sm cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-describedby="mode-description"
            >
                <option value="none" disabled={selectedMode !== 'none'}>
                    -- Select Mode --
                </option>
                <option value="full">Full Deck Review - Study all 270 cards</option>
                <option value="srs">SRS (Due Cards) - Study cards due for review</option>
            </select>
            <div id="mode-description" className="sr-only">
                Choose how you want to study: Full Deck reviews all cards, SRS only shows cards due for review based on spaced repetition.
            </div>
        </div>
    );
};

export default ModeSelector;