import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const FlashcardSkeleton: React.FC = () => {
    return (
        <div className="flashcard-container my-6 mx-auto w-full h-80 min-h-64" aria-label="Loading flashcard">
            <div className="w-full h-full relative rounded-lg shadow-lg border border-gray-300 bg-gray-50 p-6 flex flex-col justify-center items-center">
                <div className="w-full max-w-xs space-y-4">
                    {/* Term skeleton */}
                    <SkeletonLoader height="h-8" className="mx-auto" width="w-3/4" />
                    <SkeletonLoader height="h-6" className="mx-auto" width="w-1/2" />
                </div>
                
                {/* Box indicator skeleton */}
                <div className="absolute bottom-2.5 right-4">
                    <SkeletonLoader height="h-3" width="w-12" />
                </div>
            </div>
        </div>
    );
};

export default FlashcardSkeleton;