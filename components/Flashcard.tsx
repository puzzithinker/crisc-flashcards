import React, { useState, useId } from 'react';
import { Card, Progress } from '../types/flashcard';

interface FlashcardProps {
    card: Card;
    progress: Progress | null;
    onFeedback: (cardId: number, isEasy: boolean) => void;
    cardNumber?: number;
    totalCards?: number;
    isFlipped?: boolean;
    onFlip?: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
    card, 
    progress, 
    onFeedback, 
    cardNumber, 
    totalCards,
    isFlipped: externalIsFlipped,
    onFlip: externalOnFlip
}) => {
    const [internalIsFlipped, setInternalIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cardId = useId();
    const frontId = `${cardId}-front`;
    const backId = `${cardId}-back`;
    
    // Use external flip state if provided, otherwise use internal state
    const isFlipped = externalIsFlipped !== undefined ? externalIsFlipped : internalIsFlipped;
    const handleFlip = externalOnFlip || (() => setInternalIsFlipped(!internalIsFlipped));

    if (!card) {
        return (
            <div className="flashcard-container my-6 mx-auto w-full h-80 min-h-64">
                <div className="card-face absolute w-full h-full flex flex-col justify-center items-center p-6 border border-gray-300 rounded-lg bg-gray-50 text-xl text-center">
                    Loading card...
                </div>
            </div>
        );
    }

    if (!card.term || !card.definition) {
        return (
            <div className="flashcard-container my-6 mx-auto w-full h-80 min-h-64">
                <div className="card-face absolute w-full h-full flex flex-col justify-center items-center p-6 border border-red-300 rounded-lg bg-red-50 text-xl text-center text-red-700">
                    Invalid card data
                </div>
            </div>
        );
    }

    const handleFeedbackClick = (easy: boolean) => {
        try {
            if (typeof onFeedback !== 'function') {
                console.error("onFeedback is not a function");
                setError("Unable to save feedback");
                return;
            }
            
            onFeedback(card.id, easy);
            // Reset flip state after feedback
            if (externalOnFlip) {
                // External flip management - don't reset here, let parent handle it
            } else {
                setInternalIsFlipped(false);
            }
            setError(null);
        } catch (error) {
            console.error("Error handling feedback:", error);
            setError("Failed to save feedback");
        }
    };

    const cardPosition = cardNumber && totalCards ? `${cardNumber} of ${totalCards}` : '';
    const frontAriaLabel = `Flashcard ${cardPosition}: ${card.term}. Press space or enter to reveal definition.`;
    const backAriaLabel = `Definition: ${card.definition}. Use feedback buttons to rate your knowledge.`;

    return (
        <div className="flashcard-container my-6 mx-auto w-full h-80 min-h-64">
            {error && (
                <div 
                    className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </div>
            )}
            <div
                className={`flashcard w-full h-full relative cursor-pointer rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isFlipped ? 'flipped' : ''}`}
                onClick={handleFlip}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleFlip();
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label={isFlipped ? backAriaLabel : frontAriaLabel}
                aria-describedby={isFlipped ? backId : frontId}
                aria-expanded={isFlipped}
            >
                <div 
                    id={frontId}
                    className="card-face absolute w-full h-full flex flex-col justify-center items-center p-6 border border-gray-300 rounded-lg bg-gray-50 text-xl text-center overflow-y-auto text-gray-800 font-medium"
                    aria-hidden={isFlipped}
                >
                    <div className="sr-only">Term:</div>
                    {card.term}
                    <div className="sr-only">Press space or enter to see definition</div>
                </div>
                <div 
                    id={backId}
                    className="card-face card-back absolute w-full h-full flex flex-col justify-between items-center p-6 border border-gray-300 rounded-lg bg-gray-50 text-base text-center overflow-y-auto text-gray-700 leading-relaxed"
                    aria-hidden={!isFlipped}
                >
                    <div>
                        <div className="sr-only">Definition:</div>
                        <p className="mb-4 max-h-3/5 overflow-y-auto">{card.definition}</p>
                    </div>
                    <div className="flex justify-center gap-4 w-full pt-2.5 mt-auto" role="group" aria-label="Rate your knowledge of this flashcard">
                        <button
                            className="px-5 py-2 border-none rounded cursor-pointer text-sm text-white transition-colors bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={(e) => { e.stopPropagation(); handleFeedbackClick(false); }}
                            disabled={!!error}
                            aria-label="Mark as hard - I need to review this again (Press 1 or R)"
                            title="Keyboard shortcut: 1 or R"
                        >
                            Review Again (Hard)
                        </button>
                        <button
                            className="px-5 py-2 border-none rounded cursor-pointer text-sm text-white transition-colors bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={(e) => { e.stopPropagation(); handleFeedbackClick(true); }}
                            disabled={!!error}
                            aria-label="Mark as easy - I know this well (Press 2 or E)"
                            title="Keyboard shortcut: 2 or E"
                        >
                            Got it! (Easy)
                        </button>
                    </div>
                     <div className="absolute bottom-2.5 right-4 text-xs text-gray-500" aria-label={`Spaced repetition box: ${progress?.box ?? 1}`}>
                        Box: {progress?.box ?? 1}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;