import React from 'react';

interface StatusBarProps {
    reviewMessage: string;
    totalCards: number;
}

const StatusBar: React.FC<StatusBarProps> = React.memo(({ reviewMessage, totalCards }) => {
    return (
        <div className="my-4 flex justify-around items-center flex-wrap gap-2.5 w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm text-gray-600">
            <span>{reviewMessage}</span>
            <span>Total Cards: {totalCards}</span>
        </div>
    );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;