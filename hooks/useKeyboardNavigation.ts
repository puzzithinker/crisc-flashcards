import { useEffect, useCallback } from 'react';

interface KeyboardNavigationProps {
    onPrevious: () => void;
    onNext: () => void;
    onFlip: () => void;
    onEasy: () => void;
    onHard: () => void;
    canNavigate: boolean;
    isFlipped: boolean;
    isFirstCard: boolean;
    isLastCard: boolean;
}

export const useKeyboardNavigation = ({
    onPrevious,
    onNext,
    onFlip,
    onEasy,
    onHard,
    canNavigate,
    isFlipped,
    isFirstCard,
    isLastCard
}: KeyboardNavigationProps) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't interfere with form inputs or when typing
        if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement ||
            (event.target as HTMLElement).isContentEditable
        ) {
            return;
        }

        switch (event.key) {
            case ' ':
            case 'Enter':
                event.preventDefault();
                onFlip();
                break;
            
            case 'ArrowLeft':
            case 'h':
                event.preventDefault();
                if (canNavigate && !isFirstCard) {
                    onPrevious();
                }
                break;
            
            case 'ArrowRight':
            case 'l':
                event.preventDefault();
                if (canNavigate && !isLastCard) {
                    onNext();
                }
                break;
            
            case '1':
            case 'r':
                event.preventDefault();
                if (isFlipped) {
                    onHard();
                }
                break;
            
            case '2':
            case 'e':
                event.preventDefault();
                if (isFlipped) {
                    onEasy();
                }
                break;
            
            case '?':
                event.preventDefault();
                // Show keyboard shortcuts help
                alert(`Keyboard Shortcuts:
• Space/Enter: Flip card
• Left Arrow/H: Previous card
• Right Arrow/L: Next card
• 1/R: Mark as Hard (when flipped)
• 2/E: Mark as Easy (when flipped)
• ?: Show this help`);
                break;
        }
    }, [onPrevious, onNext, onFlip, onEasy, onHard, canNavigate, isFlipped, isFirstCard, isLastCard]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return null;
};