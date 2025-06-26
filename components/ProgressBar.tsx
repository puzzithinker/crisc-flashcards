import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    className?: string;
    showPercentage?: boolean;
    color?: 'blue' | 'green' | 'yellow' | 'red';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    className = '',
    showPercentage = false,
    color = 'blue'
}) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        yellow: 'bg-yellow-500',
        red: 'bg-red-600'
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-center mb-1" aria-hidden="true">
                <span className="text-sm font-medium text-gray-700">
                    {current} of {total}
                </span>
                {showPercentage && (
                    <span className="text-sm font-medium text-gray-700">
                        {percentage}%
                    </span>
                )}
            </div>
            <div 
                className="w-full bg-gray-200 rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`Progress: ${current} of ${total} completed`}
            >
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="sr-only">
                Progress: {current} out of {total} completed ({percentage}%)
            </span>
        </div>
    );
};

export default ProgressBar;