import React from 'react';

interface ProgressIndicatorProps {
    currentIndex: number;
    totalCards: number;
    canNavigate: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = React.memo(({
    currentIndex,
    totalCards,
    canNavigate
}) => {
    return (
        <div className="my-4 text-base text-gray-700 font-medium">
            {canNavigate ? `Card ${currentIndex + 1} of ${totalCards}` : 'No cards in current review.'}
        </div>
    );
});

ProgressIndicator.displayName = 'ProgressIndicator';

export default ProgressIndicator;