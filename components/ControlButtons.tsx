import React from 'react';

interface ControlButtonsProps {
    onShuffle: () => void;
    onResetProgress: () => void;
    canShuffle: boolean;
    isClient: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ 
    onShuffle, 
    onResetProgress, 
    canShuffle, 
    isClient 
}) => {
    return (
        <div className="my-4 flex justify-center items-center flex-wrap gap-2.5 w-full" role="group" aria-label="Study controls">
            <button 
                onClick={onShuffle} 
                disabled={!canShuffle} 
                className="px-4 py-2 rounded border-none text-sm cursor-pointer transition-all min-w-24 bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                aria-label="Shuffle the current deck of flashcards"
                title="Randomly reorder the current deck"
            >
                Shuffle Deck
            </button>
            <button 
                onClick={onResetProgress} 
                disabled={!isClient} 
                className="px-4 py-2 rounded border-none text-sm cursor-pointer transition-all min-w-24 bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                aria-label="Reset all learning progress and start over"
                title="Warning: This will reset all your progress"
            >
                Reset All Progress
            </button>
        </div>
    );
};

export default ControlButtons;