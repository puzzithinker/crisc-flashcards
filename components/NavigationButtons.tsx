import React from 'react';

interface NavigationButtonsProps {
    onPrevious: () => void;
    onNext: () => void;
    canNavigate: boolean;
    isFirstCard: boolean;
    isLastCard: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    onPrevious,
    onNext,
    canNavigate,
    isFirstCard,
    isLastCard
}) => {
    return (
        <nav className="my-4 flex justify-center items-center flex-wrap gap-2.5 w-full" aria-label="Flashcard navigation">
            <button 
                onClick={onPrevious} 
                disabled={!canNavigate || isFirstCard}
                className="px-4 py-2 rounded border-none text-sm cursor-pointer transition-all min-w-24 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                aria-label="Go to previous flashcard (Left arrow or H)"
                title="Keyboard shortcut: Left arrow or H"
            >
                Previous
            </button>
            <button 
                onClick={onNext} 
                disabled={!canNavigate || isLastCard}
                className="px-4 py-2 rounded border-none text-sm cursor-pointer transition-all min-w-24 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                aria-label="Go to next flashcard (Right arrow or L)"
                title="Keyboard shortcut: Right arrow or L"
            >
                Next
            </button>
        </nav>
    );
};

export default NavigationButtons;